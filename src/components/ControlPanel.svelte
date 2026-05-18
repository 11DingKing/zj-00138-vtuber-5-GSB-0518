<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { modelState, setExpression as setExprState, setPose as setPoseState } from '../stores/modelStore.svelte'
  import { addRecordAction } from '../stores/recordingStore.svelte'

  function setExpression(id: string) {
    setExprState(id)
    addRecordAction('expression', id)
    setTimeout(() => {
      if (modelState.currentExpression === id) {
        setExprState(null)
      }
    }, 2000)
  }

  function setPose(id: string) {
    setPoseState(id)
    addRecordAction('pose', id)
  }

  function handleKeydown(e: KeyboardEvent) {
    const expr = modelState.expressions.find(ex => ex.shortcut === e.key)
    if (expr) {
      setExpression(expr.id)
      return
    }
    const pose = modelState.poses.find(p => p.shortcut === e.key)
    if (pose) {
      setPose(pose.id)
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<div class="control-panel">
  <div class="section">
    <h3>表情控制 <span class="hint">快捷键 1-5</span></h3>
    <div class="grid">
      {#each modelState.expressions as expr}
        <button 
          class="expr-btn"
          class:active={modelState.currentExpression === expr.id}
          onclick={() => setExpression(expr.id)}
        >
          <span class="name">{expr.name}</span>
          {#if expr.shortcut}
            <span class="shortcut">{expr.shortcut}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <div class="section">
    <h3>姿态控制 <span class="hint">快捷键 6-9</span></h3>
    <div class="grid">
      {#each modelState.poses as pose}
        <button 
          class="pose-btn"
          class:active={modelState.currentPose === pose.id}
          onclick={() => setPose(pose.id)}
        >
          <span class="name">{pose.name}</span>
          {#if pose.shortcut}
            <span class="shortcut">{pose.shortcut}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .control-panel {
    height: 100%;
    padding: 16px;
    background: #1a202c;
    border-radius: 8px;
    overflow-y: auto;
  }

  .section {
    margin-bottom: 24px;
  }

  h3 {
    margin: 0 0 12px 0;
    color: #e2e8f0;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hint {
    font-size: 11px;
    font-weight: 400;
    color: #718096;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .expr-btn,
  .pose-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    background: #2d3748;
    border: 2px solid transparent;
    border-radius: 8px;
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .expr-btn:hover,
  .pose-btn:hover {
    background: #4a5568;
    color: #e2e8f0;
    transform: translateY(-2px);
  }

  .expr-btn.active {
    border-color: #f6ad55;
    background: #7c2d12;
    color: #fbd38d;
  }

  .pose-btn.active {
    border-color: #63b3ed;
    background: #2a4365;
    color: #90cdf4;
  }

  .name {
    font-size: 13px;
    font-weight: 500;
  }

  .shortcut {
    font-size: 10px;
    padding: 2px 6px;
    background: #4a5568;
    border-radius: 4px;
    color: #a0aec0;
  }

  .expr-btn.active .shortcut,
  .pose-btn.active .shortcut {
    background: rgba(255, 255, 255, 0.2);
    color: currentColor;
  }
</style>
