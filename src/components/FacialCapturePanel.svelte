<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { facialCaptureState, setFacialCaptureIntensity } from '../stores/facialCaptureStore.svelte'
  import { startCapture, stopCapture, loadModels } from '../facialCapture'
  import type { FacialCaptureParams } from '../types'

  let videoEl: HTMLVideoElement
  let canvasEl: HTMLCanvasElement
  let isLoading = $state(false)
  let errorMessage = $state('')

  async function handleStartCapture() {
    isLoading = true
    errorMessage = ''
    
    try {
      await startCapture(videoEl, canvasEl)
    } catch (err) {
      errorMessage = '启动失败: ' + (err as Error).message
    } finally {
      isLoading = false
    }
  }

  function handleStopCapture() {
    stopCapture()
  }

  function handleIntensityChange(e: Event) {
    const target = e.target as HTMLInputElement
    setFacialCaptureIntensity(parseFloat(target.value))
  }

  function getParamValue(key: keyof FacialCaptureParams): number {
    return facialCaptureState.facialCaptureParams[key]
  }

  const paramLabels: Record<keyof FacialCaptureParams, string> = {
    smile: '😊 微笑',
    eyeOpenness: '👁️ 睁眼度',
    mouthOpenness: '👄 张嘴度',
    browRaise: '↗️ 挑眉',
    browFurrow: '↘️ 皱眉',
    jawOpen: '🦷 下颌张开',
    lipStretch: '↔️ 嘴唇拉伸',
    lipPucker: '😗 嘴唇噘起',
    headTilt: '🔄 头部倾斜'
  }

  onMount(async () => {
    try {
      await loadModels()
    } catch (err) {
      console.error('预加载模型失败:', err)
    }
  })

  onDestroy(() => {
    if (facialCaptureState.isFacialCapturing) {
      stopCapture()
    }
  })
</script>

<div class="facial-capture-panel">
  <div class="header">
    <h3>📷 摄像头表情捕捉</h3>
    <div class="status" class:active={facialCaptureState.isFacialCapturing}>
      {facialCaptureState.isFacialCapturing ? '🔴 捕捉中' : '⚪ 待机'}
    </div>
  </div>

  <div class="video-container">
    <video bind:this={videoEl} class="video-preview" playsinline muted></video>
    <canvas bind:this={canvasEl} class="overlay-canvas"></canvas>
    {#if !facialCaptureState.isFacialCapturing}
      <div class="placeholder">
        <span>点击下方按钮启动摄像头</span>
      </div>
    {/if}
  </div>

  <div class="controls">
    {#if !facialCaptureState.isFacialCapturing}
      <button 
        class="capture-btn start" 
        onclick={handleStartCapture}
        disabled={isLoading}
      >
        {isLoading ? '⏳ 加载中...' : '▶️ 开始捕捉'}
      </button>
    {:else}
      <button class="capture-btn stop" onclick={handleStopCapture}>
        ⏹️ 停止捕捉
      </button>
    {/if}
  </div>

  {#if errorMessage}
    <div class="error-message">{errorMessage}</div>
  {/if}

  <div class="intensity-control">
    <label>映射强度: {(facialCaptureState.facialCaptureIntensity * 100).toFixed(0)}%</label>
    <input 
      type="range" 
      min="0" 
      max="2" 
      step="0.1" 
      value={facialCaptureState.facialCaptureIntensity}
      oninput={handleIntensityChange}
    />
  </div>

  <div class="params-display">
    <h4>实时表情参数</h4>
    <div class="params-grid">
      {#each Object.keys(paramLabels) as key (key)}
        <div class="param-item">
          <span class="param-label">{paramLabels[key as keyof FacialCaptureParams]}</span>
          <div class="param-bar">
            <div 
              class="param-fill" 
              style="width: {Math.abs(getParamValue(key as keyof FacialCaptureParams)) * 100}%"
            ></div>
          </div>
          <span class="param-value">
            {(getParamValue(key as keyof FacialCaptureParams) * 100).toFixed(0)}%
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .facial-capture-panel {
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
    margin: 0 0 8px 0;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 600;
  }

  .status {
    font-size: 12px;
    color: #a0aec0;
    padding: 4px 8px;
    background: #4a5568;
    border-radius: 4px;
  }

  .status.active {
    color: #fc8181;
    background: #742a2a;
  }

  .video-container {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    background: #0d1117;
    overflow: hidden;
  }

  .video-preview,
  .overlay-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay-canvas {
    z-index: 1;
  }

  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #718096;
    font-size: 14px;
  }

  .controls {
    padding: 12px 16px;
    border-bottom: 1px solid #2d3748;
  }

  .capture-btn {
    width: 100%;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .capture-btn.start {
    background: #38a169;
    color: white;
  }

  .capture-btn.start:hover {
    background: #2f855a;
  }

  .capture-btn.start:disabled {
    background: #4a5568;
    cursor: not-allowed;
  }

  .capture-btn.stop {
    background: #c53030;
    color: white;
  }

  .capture-btn.stop:hover {
    background: #9b2c2c;
  }

  .error-message {
    padding: 8px 16px;
    background: #742a2a;
    color: #fc8181;
    font-size: 12px;
  }

  .intensity-control {
    padding: 12px 16px;
    border-bottom: 1px solid #2d3748;
  }

  .intensity-control label {
    display: block;
    margin-bottom: 8px;
    color: #e2e8f0;
    font-size: 13px;
  }

  .intensity-control input[type="range"] {
    width: 100%;
    height: 6px;
    background: #4a5568;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
  }

  .intensity-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #3182ce;
    border-radius: 50%;
    cursor: pointer;
  }

  .params-display {
    flex: 1;
    padding: 12px 16px;
    overflow-y: auto;
  }

  .params-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .param-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .param-label {
    width: 90px;
    font-size: 11px;
    color: #a0aec0;
    flex-shrink: 0;
  }

  .param-bar {
    flex: 1;
    height: 6px;
    background: #2d3748;
    border-radius: 3px;
    overflow: hidden;
  }

  .param-fill {
    height: 100%;
    background: linear-gradient(90deg, #3182ce, #38a169);
    transition: width 0.1s ease;
  }

  .param-value {
    width: 40px;
    text-align: right;
    font-size: 11px;
    color: #e2e8f0;
    flex-shrink: 0;
  }
</style>
