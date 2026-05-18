<script lang="ts">
  import { onMount } from 'svelte'
  import { initVoices } from './stores/modelStore.svelte'
  import { initDefaultData } from './defaultData'
  import ModelPreview from './components/ModelPreview.svelte'
  import ControlPanel from './components/ControlPanel.svelte'
  import ScriptPanel from './components/ScriptPanel.svelte'
  import DanmakuPanel from './components/DanmakuPanel.svelte'
  import RecordingPanel from './components/RecordingPanel.svelte'
  import FacialCapturePanel from './components/FacialCapturePanel.svelte'

  let leftWidth = $state(400)
  let rightWidth = $state(350)
  let facialCaptureWidth = $state(320)
  let isDraggingLeft = $state(false)
  let isDraggingRight = $state(false)
  let isDraggingFacial = $state(false)
  let activeBottomTab = $state<'danmaku' | 'recording'>('danmaku')

  function handleMouseMove(e: MouseEvent) {
    if (isDraggingLeft) {
      leftWidth = Math.max(300, Math.min(600, e.clientX))
    } else if (isDraggingRight) {
      const container = document.querySelector('.app-container') as HTMLElement
      if (container) {
        const rect = container.getBoundingClientRect()
        rightWidth = Math.max(250, Math.min(500, rect.right - e.clientX))
      }
    } else if (isDraggingFacial) {
      facialCaptureWidth = Math.max(260, Math.min(450, window.innerWidth - e.clientX))
    }
  }

  function handleMouseUp() {
    isDraggingLeft = false
    isDraggingRight = false
    isDraggingFacial = false
  }

  onMount(() => {
    initVoices()
    initDefaultData()
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  })
</script>

<div class="app-container">
  <div class="panel left-panel" style="width: {leftWidth}px;">
    <ModelPreview />
  </div>

  <div 
    class="resizer left-resizer"
    class:dragging={isDraggingLeft}
    onmousedown={() => isDraggingLeft = true}
  ></div>

  <div class="panel center-panel">
    <ControlPanel />
  </div>

  <div 
    class="resizer right-resizer"
    class:dragging={isDraggingRight}
    onmousedown={() => isDraggingRight = true}
  ></div>

  <div class="panel right-panel" style="width: {rightWidth}px;">
    <ScriptPanel />
  </div>

  <div 
    class="resizer facial-resizer"
    class:dragging={isDraggingFacial}
    onmousedown={() => isDraggingFacial = true}
  ></div>

  <div class="panel facial-capture-panel" style="width: {facialCaptureWidth}px;">
    <FacialCapturePanel />
  </div>
</div>

<div class="bottom-container">
  <div class="bottom-tabs">
    <button 
      class="tab-btn"
      class:active={activeBottomTab === 'danmaku'}
      onclick={() => activeBottomTab = 'danmaku'}
    >
      💬 弹幕浮窗
    </button>
    <button 
      class="tab-btn"
      class:active={activeBottomTab === 'recording'}
      onclick={() => activeBottomTab = 'recording'}
    >
      🎥 录像回放
    </button>
  </div>
  <div class="bottom-content">
    {#if activeBottomTab === 'danmaku'}
      <DanmakuPanel />
    {:else}
      <RecordingPanel />
    {/if}
  </div>
</div>

<style>
  .app-container {
    display: flex;
    height: calc(100vh - 180px);
    background: #0d1117;
    gap: 8px;
    padding: 8px;
  }

  .panel {
    background: #161b22;
    border-radius: 8px;
    overflow: hidden;
  }

  .left-panel,
  .right-panel {
    flex-shrink: 0;
  }

  .center-panel {
    flex: 1;
    min-width: 300px;
  }

  .resizer {
    width: 6px;
    background: #30363d;
    cursor: col-resize;
    border-radius: 3px;
    transition: background 0.2s ease;
    flex-shrink: 0;
    margin: auto 0;
    height: 80%;
  }

  .resizer:hover,
  .resizer.dragging {
    background: #58a6ff;
  }

  .facial-resizer {
    margin-left: 8px;
  }

  .facial-capture-panel {
    flex-shrink: 0;
    overflow: hidden;
  }

  .bottom-container {
    height: 180px;
    padding: 0 8px 8px 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bottom-tabs {
    display: flex;
    gap: 4px;
  }

  .tab-btn {
    padding: 8px 16px;
    background: #21262d;
    border: none;
    border-radius: 6px 6px 0 0;
    color: #8b949e;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-btn:hover {
    background: #30363d;
    color: #c9d1d9;
  }

  .tab-btn.active {
    background: #0d4429;
    color: #3fb950;
  }

  .bottom-content {
    flex: 1;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  }

  :global(#app) {
    width: 100vw;
    height: 100vh;
    background: #0d1117;
  }
</style>
