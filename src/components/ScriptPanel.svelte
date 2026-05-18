<script lang="ts">
  import { scriptState, startPlayback, stopPlayback, setCurrentScript } from '../stores/scriptStore.svelte'
  import { modelState, setExpression } from '../stores/modelStore.svelte'
  import { speak, stopSpeaking } from '../tts'
  import type { ScriptStage } from '../types'

  let selectedVoice = $state('')
  let editingStage = $state<ScriptStage | null>(null)

  const currentScript = scriptState.scripts[0]

  function getProgress(stageIndex: number): number {
    if (!scriptState.isPlaying || scriptState.currentScriptId !== currentScript?.id) {
      return 0
    }
    if (scriptState.currentStageIndex > stageIndex) {
      return 100
    }
    if (scriptState.currentStageIndex === stageIndex) {
      return 50
    }
    return 0
  }

  function playStage(index: number) {
    if (!currentScript) return
    const stage = currentScript.stages[index]
    
    if (stage.expressions.length > 0) {
      setExpression(stage.expressions[0])
    }
    
    speak(stage.ttsText, selectedVoice, () => {
      if (index < currentScript.stages.length - 1 && scriptState.isPlaying) {
        setTimeout(() => {
          if (scriptState.isPlaying) {
            playStage(index + 1)
          }
        }, 500)
      } else if (index === currentScript.stages.length - 1) {
        stopPlayback()
        setCurrentScript(null)
      }
    })
  }

  function startScript() {
    if (!currentScript) return
    stopSpeaking()
    startPlayback()
    setCurrentScript(currentScript.id)
    playStage(0)
  }

  function pauseScript() {
    stopPlayback()
    stopSpeaking()
  }

  function resetScript() {
    stopPlayback()
    setCurrentScript(null)
    stopSpeaking()
  }

  function playStageNow(index: number) {
    stopSpeaking()
    startPlayback()
    setCurrentScript(currentScript?.id || null)
    playStage(index)
  }

  function openStageEditor(stage: ScriptStage) {
    editingStage = { ...stage }
  }

  function saveStage() {
    if (!editingStage || !currentScript) return
    const stage = editingStage
    const index = currentScript.stages.findIndex(s => s.id === stage.id)
    if (index !== -1) {
      currentScript.stages[index] = stage
    }
    editingStage = null
  }
</script>

<div class="script-panel">
  <div class="header">
    <h3>剧本面板</h3>
    <div class="voice-select">
      <select bind:value={selectedVoice}>
        <option value="">默认音色</option>
        {#each modelState.availableVoices as voice}
          <option value={voice.name}>{voice.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if currentScript}
    <div class="script-title">
      <h4>{currentScript.name}</h4>
    </div>

    <div class="stages">
      {#each currentScript.stages as stage, i}
        <div 
          class="stage"
          class:active={scriptState.currentStageIndex === i && scriptState.isPlaying}
          class:completed={getProgress(i) === 100}
          ondblclick={() => openStageEditor(stage)}
        >
          <div class="stage-header">
            <span class="stage-number">{i + 1}</span>
            <span class="stage-name">{stage.name}</span>
            <button 
              class="play-stage-btn"
              onclick={(e) => { e.stopPropagation(); playStageNow(i) }}
              title="播放此阶段"
            >
              ▶
            </button>
          </div>
          <div class="stage-text">{stage.ttsText}</div>
          <div class="progress-bar">
            <div class="progress" style="width: {getProgress(i)}%"></div>
          </div>
        </div>
      {/each}
    </div>

    <div class="controls">
      {#if !scriptState.isPlaying}
        <button class="btn primary" onclick={startScript}>
          ▶ 开始播放
        </button>
      {:else}
        <button class="btn warning" onclick={pauseScript}>
          ⏸ 暂停
        </button>
      {/if}
      <button class="btn secondary" onclick={resetScript}>
        ↺ 重置
      </button>
    </div>
  {/if}
</div>

{#if editingStage}
  <div class="modal-overlay" onclick={() => editingStage = null}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h4>编辑阶段</h4>
      <div class="form-group">
        <label>阶段名称</label>
        <input type="text" bind:value={editingStage.name} />
      </div>
      <div class="form-group">
        <label>TTS 文本</label>
        <textarea rows={4} bind:value={editingStage.ttsText}></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn secondary" onclick={() => editingStage = null}>取消</button>
        <button class="btn primary" onclick={saveStage}>保存</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .script-panel {
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

  h4 {
    margin: 0;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 600;
  }

  .voice-select select {
    padding: 6px 10px;
    background: #4a5568;
    border: none;
    border-radius: 4px;
    color: #e2e8f0;
    font-size: 12px;
    cursor: pointer;
  }

  .script-title {
    padding: 12px 16px;
    border-bottom: 1px solid #2d3748;
  }

  .stages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .stage {
    padding: 12px;
    background: #2d3748;
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 3px solid #4a5568;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .stage:hover {
    background: #3d4a5c;
  }

  .stage.active {
    border-left-color: #48bb78;
    background: #22543d;
  }

  .stage.completed {
    border-left-color: #68d391;
    opacity: 0.7;
  }

  .stage-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .stage-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #4a5568;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    color: #a0aec0;
  }

  .stage.active .stage-number {
    background: #48bb78;
    color: white;
  }

  .stage-name {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
  }

  .play-stage-btn {
    padding: 4px 8px;
    background: transparent;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    border-radius: 4px;
    font-size: 10px;
  }

  .play-stage-btn:hover {
    background: #4a5568;
    color: #e2e8f0;
  }

  .stage-text {
    font-size: 12px;
    color: #a0aec0;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .progress-bar {
    height: 3px;
    background: #4a5568;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background: #48bb78;
    transition: width 0.3s ease;
  }

  .controls {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid #2d3748;
  }

  .btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn.primary {
    background: #3182ce;
    color: white;
  }

  .btn.primary:hover {
    background: #2b6cb0;
  }

  .btn.warning {
    background: #d69e2e;
    color: white;
  }

  .btn.warning:hover {
    background: #b7791f;
  }

  .btn.secondary {
    background: #4a5568;
    color: #e2e8f0;
  }

  .btn.secondary:hover {
    background: #718096;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: #2d3748;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
  }

  .modal h4 {
    margin-bottom: 16px;
    font-size: 16px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: #a0aec0;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    background: #1a202c;
    border: 1px solid #4a5568;
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 13px;
    box-sizing: border-box;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    justify-content: flex-end;
  }

  .modal-actions .btn {
    flex: none;
  }
</style>
