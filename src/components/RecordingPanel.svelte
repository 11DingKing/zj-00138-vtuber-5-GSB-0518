<script lang="ts">
  import { onMount } from 'svelte'
  import { recordingState, startRecording, stopRecording } from '../stores/recordingStore.svelte'
import { facialCaptureState, startFacialCapture, stopFacialCapture, updateFacialCaptureParams } from '../stores/facialCaptureStore.svelte'
import { setExpression, startPlaybackMode, stopPlaybackMode } from '../stores/modelStore.svelte'
  import { saveRecording, getAllRecordings, deleteRecording as dbDeleteRecording } from '../db'
  import type { Recording } from '../types'
  import { speak } from '../tts'

  let recordings = $state<Recording[]>([])
  let localIsPlayingBack = $state(false)

  async function loadRecordings() {
    try {
      recordings = await getAllRecordings()
    } catch (err) {
      console.error('加载录像失败:', err)
    }
  }

  async function handleStopRecording() {
    stopRecording()
    if (recordingState.recordActions.length > 0) {
      const recording: Recording = {
        id: `rec-${Date.now()}`,
        name: `录像 ${new Date().toLocaleString()}`,
        actions: [...recordingState.recordActions],
        startTime: recordingState.recordingStartTime,
        endTime: Date.now()
      }
      try {
        await saveRecording(recording)
        await loadRecordings()
      } catch (err) {
        console.error('保存录像失败:', err)
      }
    }
  }

  async function deleteRecording(id: string) {
    try {
      await dbDeleteRecording(id)
      await loadRecordings()
    } catch (err) {
      console.error('删除录像失败:', err)
    }
  }

  onMount(() => {
    loadRecordings()
  })

  async function playRecording(recording: Recording) {
    if (localIsPlayingBack) return
    localIsPlayingBack = true
    startPlaybackMode()
    
    const wasFacialCapturing = facialCaptureState.isFacialCapturing
    const originalFacialParams = { ...facialCaptureState.facialCaptureParams }
    
    let lastTime = 0
    for (const action of recording.actions) {
      const delay = action.timestamp - lastTime
      await new Promise(resolve => setTimeout(resolve, delay))
      
      if (!localIsPlayingBack) break
      
      switch (action.type) {
        case 'expression':
          setExpression(action.data as string)
          break
        case 'tts':
          const ttsData = action.data as { text: string; voiceName?: string }
          await new Promise<void>(resolve => {
            speak(ttsData.text, ttsData.voiceName, () => resolve())
          })
          break
        case 'facialCapture':
          const facialData = action.data as {
            smile: number
            eyeOpenness: number
            mouthOpenness: number
            browRaise: number
            browFurrow: number
            jawOpen: number
            lipStretch: number
            lipPucker: number
            headTilt: number
          }
          updateFacialCaptureParams(facialData)
          break
      }
      
      lastTime = action.timestamp
    }
    
    if (wasFacialCapturing) {
      startFacialCapture()
    } else {
      stopFacialCapture()
    }
    updateFacialCaptureParams(originalFacialParams)
    localIsPlayingBack = false
    stopPlaybackMode()
  }

  function stopPlayback() {
    localIsPlayingBack = false
    stopPlaybackMode()
  }

  function exportRecording(recording: Recording) {
    const dataStr = JSON.stringify(recording, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recording.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importRecording(file: File) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const recording = JSON.parse(e.target?.result as string) as Recording
        await saveRecording(recording)
        await loadRecordings()
      } catch (err) {
        console.error('导入失败:', err)
      }
    }
    reader.readAsText(file)
  }

  function handleFileInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      importRecording(file)
    }
  }
</script>

<div class="recording-panel">
  <div class="header">
    <h3>录像回放</h3>
    <div class="header-actions">
      {#if !recordingState.isRecording}
        <button class="record-btn" onclick={startRecording}>
          ⏺ 开始录制
        </button>
      {:else}
        <button class="record-btn recording" onclick={handleStopRecording}>
          ⏹ 停止录制
        </button>
      {/if}
      <label class="import-btn">
        📂 导入
        <input type="file" accept=".json" onchange={handleFileInput} hidden />
      </label>
    </div>
  </div>

  <div class="recording-list">
    {#each recordings as recording (recording.id)}
      <div class="recording-item">
        <div class="recording-info">
          <span class="name">{recording.name}</span>
          <span class="duration">
            {Math.round((recording.endTime - recording.startTime) / 1000)}s
            · {recording.actions.length} 个动作
          </span>
        </div>
        <div class="recording-actions">
          {#if !localIsPlayingBack}
            <button class="play-btn" onclick={() => playRecording(recording)}>
              ▶ 播放
            </button>
          {:else}
            <button class="stop-btn" onclick={stopPlayback}>
              ⏹ 停止
            </button>
          {/if}
          <button class="export-btn" onclick={() => exportRecording(recording)}>
            💾 导出
          </button>
          <button class="delete-btn" onclick={() => deleteRecording(recording.id)}>
            🗑 删除
          </button>
        </div>
      </div>
    {/each}
    {#if recordings.length === 0}
      <div class="empty-state">
        暂无录像，点击上方按钮开始录制
      </div>
    {/if}
  </div>

  {#if recordingState.isRecording}
    <div class="recording-indicator">
      <span class="pulse-dot"></span>
      正在录制中... ({recordingState.recordActions.length} 个动作)
    </div>
  {/if}
</div>

<style>
  .recording-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1a202c;
    border-radius: 8px;
    overflow: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #2d3748;
    border-bottom: 1px solid #4a5568;
  }

  h3 {
    margin: 0;
    color: #e2e8f0;
    font-size: 14px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .record-btn {
    padding: 6px 12px;
    background: #c53030;
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .record-btn:hover {
    background: #9b2c2c;
  }

  .record-btn.recording {
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .import-btn {
    padding: 6px 12px;
    background: #4a5568;
    border: none;
    border-radius: 4px;
    color: #a0aec0;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .import-btn:hover {
    background: #718096;
    color: #e2e8f0;
  }

  .recording-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .recording-item {
    padding: 12px;
    background: #2d3748;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .recording-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .name {
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
  }

  .duration {
    font-size: 11px;
    color: #718096;
  }

  .recording-actions {
    display: flex;
    gap: 6px;
  }

  .play-btn,
  .stop-btn,
  .export-btn {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .play-btn {
    background: #38a169;
    color: white;
  }

  .play-btn:hover {
    background: #2f855a;
  }

  .stop-btn {
    background: #c53030;
    color: white;
  }

  .stop-btn:hover {
    background: #9b2c2c;
  }

  .export-btn {
    background: #3182ce;
    color: white;
  }

  .export-btn:hover {
    background: #2b6cb0;
  }

  .delete-btn {
    background: #c53030;
    color: white;
  }

  .delete-btn:hover {
    background: #9b2c2c;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #718096;
    font-size: 13px;
  }

  .recording-indicator {
    padding: 10px 16px;
    background: #742a2a;
    color: #fc8181;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #fc8181;
    border-radius: 50%;
    animation: pulse 1s infinite;
  }
</style>
