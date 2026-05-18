<script lang="ts">
  import { danmakuState, startDanmakuSimulation, stopDanmakuSimulation } from '../stores/danmakuStore.svelte'
  import { speak } from '../tts'
  import type { Danmaku } from '../types'

  let showReplyModal = $state(false)
  let selectedDanmaku = $state<Danmaku | null>(null)
  let replyText = $state('')
  let isSimulating = $state(false)

  function toggleSimulation() {
    isSimulating = !isSimulating
    if (isSimulating) {
      startDanmakuSimulation()
    } else {
      stopDanmakuSimulation()
    }
  }

  function openReply(danmaku: Danmaku) {
    selectedDanmaku = danmaku
    replyText = `感谢 ${danmaku.username} 的提问！`
    showReplyModal = true
  }

  function sendReply() {
    if (replyText.trim()) {
      speak(replyText)
    }
    showReplyModal = false
    selectedDanmaku = null
    replyText = ''
  }

  function generateQuickReply(danmaku: Danmaku) {
    const replies = [
      `谢谢 ${danmaku.username} 的支持！`,
      `${danmaku.username} 这个问题问得好！`,
      `感谢 ${danmaku.username} 的评论！`,
      `${danmaku.username} 说得对！`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
</script>

<div class="danmaku-panel">
  <div class="header">
    <h3>弹幕浮窗</h3>
    <button 
      class="sim-btn"
      class:active={isSimulating}
      onclick={toggleSimulation}
    >
      {isSimulating ? '⏸ 停止模拟' : '▶ 模拟弹幕'}
    </button>
  </div>

  <div class="danmaku-list">
    {#each [...danmakuState.danmakus].reverse() as danmaku (danmaku.id)}
      <div class="danmaku-item" onclick={() => openReply(danmaku)}>
        <span class="username">{danmaku.username}</span>
        <span class="text">{danmaku.text}</span>
        <span class="reply-hint">💬 点击回复</span>
      </div>
    {/each}
    {#if danmakuState.danmakus.length === 0}
      <div class="empty-state">
        暂无弹幕，点击上方按钮开始模拟
      </div>
    {/if}
  </div>
</div>

{#if showReplyModal && selectedDanmaku}
  <div class="modal-overlay" onclick={() => showReplyModal = false}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h4>快速回应</h4>
      <div class="selected-danmaku">
        <span class="username">{selectedDanmaku.username}:</span>
        <span class="text">{selectedDanmaku.text}</span>
      </div>
      <div class="form-group">
        <label>回应内容</label>
        <textarea rows={3} bind:value={replyText}></textarea>
      </div>
      <div class="quick-replies">
        <button 
          class="quick-btn"
          onclick={() => selectedDanmaku && (replyText = generateQuickReply(selectedDanmaku))}
        >
          🎲 随机生成
        </button>
      </div>
      <div class="modal-actions">
        <button class="btn secondary" onclick={() => showReplyModal = false}>取消</button>
        <button class="btn primary" onclick={sendReply}>发送回应</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .danmaku-panel {
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

  .sim-btn {
    padding: 6px 12px;
    background: #4a5568;
    border: none;
    border-radius: 4px;
    color: #a0aec0;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sim-btn:hover {
    background: #718096;
    color: #e2e8f0;
  }

  .sim-btn.active {
    background: #38a169;
    color: white;
  }

  .danmaku-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .danmaku-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #2d3748;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .danmaku-item:hover {
    background: #3d4a5c;
  }

  .username {
    font-size: 12px;
    font-weight: 600;
    color: #9f7aea;
    white-space: nowrap;
  }

  .text {
    flex: 1;
    font-size: 12px;
    color: #e2e8f0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reply-hint {
    font-size: 10px;
    color: #718096;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .danmaku-item:hover .reply-hint {
    opacity: 1;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #718096;
    font-size: 13px;
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
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #e2e8f0;
  }

  .selected-danmaku {
    padding: 12px;
    background: #1a202c;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .selected-danmaku .username {
    color: #9f7aea;
  }

  .selected-danmaku .text {
    color: #e2e8f0;
    white-space: normal;
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

  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    background: #1a202c;
    border: 1px solid #4a5568;
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 13px;
    box-sizing: border-box;
    resize: vertical;
  }

  .quick-replies {
    margin-bottom: 16px;
  }

  .quick-btn {
    padding: 8px 12px;
    background: #553c9a;
    border: none;
    border-radius: 6px;
    color: #e9d8fd;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quick-btn:hover {
    background: #6b46c1;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .btn {
    padding: 8px 16px;
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

  .btn.secondary {
    background: #4a5568;
    color: #e2e8f0;
  }

  .btn.secondary:hover {
    background: #718096;
  }
</style>
