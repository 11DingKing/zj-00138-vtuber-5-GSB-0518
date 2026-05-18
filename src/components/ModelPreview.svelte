<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { modelState, setExpression } from '../stores/modelStore.svelte'
  import { recordingState } from '../stores/recordingStore.svelte'
  import { facialCaptureState } from '../stores/facialCaptureStore.svelte'

  let canvasEl: HTMLCanvasElement
  let animationId: number
  let blinkTimer: number
  let time = 0

  function drawCharacter(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height)
    
    const scale = Math.min(width, height) / 600
    const centerX = width / 2
    const centerY = height / 2 + 40 * scale
    
    const currentExpr = modelState.expressions.find(e => e.id === modelState.currentExpression)
    const currentPoseData = modelState.poses.find(p => p.id === modelState.currentPose)
    
    const exprParams = currentExpr?.params || {}
    const poseParams = currentPoseData?.params || {}
    
    const useFacialCapture = facialCaptureState.isFacialCapturing || modelState.isPlayingBack
    const intensity = facialCaptureState.facialCaptureIntensity
    
    let smile: number
    let eyeOpenness: number
    let mouthOpennessVal: number
    let browAngle: number
    
    if (useFacialCapture) {
      smile = facialCaptureState.facialCaptureParams.smile * intensity
      eyeOpenness = 1 - (1 - facialCaptureState.facialCaptureParams.eyeOpenness) * intensity
      mouthOpennessVal = facialCaptureState.facialCaptureParams.mouthOpenness * intensity
      browAngle = (facialCaptureState.facialCaptureParams.browRaise - facialCaptureState.facialCaptureParams.browFurrow) * 15 * intensity
    } else {
      smile = exprParams.smile ?? 0
      eyeOpenness = exprParams.eyes ?? 1
      mouthOpennessVal = modelState.mouthOpenness
      browAngle = (exprParams.brow ?? 0) * 10
    }
    const armPose = poseParams.arms ?? 0
    const waveAmount = poseParams.wave ?? 0
    
    ctx.fillStyle = '#4a5568'
    ctx.beginPath()
    ctx.ellipse(centerX, centerY + 100 * scale, 60 * scale, 80 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.save()
    ctx.translate(centerX - 70 * scale, centerY + 60 * scale)
    ctx.rotate(-0.3 + armPose * 0.8 + Math.sin(time * 5 + waveAmount * 2) * waveAmount * 0.3)
    ctx.fillStyle = '#ffd4b8'
    ctx.beginPath()
    ctx.ellipse(0, 20 * scale, 15 * scale, 40 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    ctx.save()
    ctx.translate(centerX + 70 * scale, centerY + 60 * scale)
    ctx.rotate(0.3 - armPose * 0.8)
    ctx.fillStyle = '#ffd4b8'
    ctx.beginPath()
    ctx.ellipse(0, 20 * scale, 15 * scale, 40 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    ctx.fillStyle = '#ffd4b8'
    ctx.beginPath()
    ctx.arc(centerX, centerY - 50 * scale, 70 * scale, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#8b5a2b'
    ctx.beginPath()
    ctx.ellipse(centerX, centerY - 90 * scale, 65 * scale, 40 * scale, 0, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(centerX - 65 * scale, centerY - 90 * scale, 130 * scale, 30 * scale)
    
    ctx.save()
    ctx.translate(centerX - 35 * scale, centerY - 50 * scale)
    ctx.scale(1, eyeOpenness)
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(0, 0, 18 * scale, 15 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2d3748'
    ctx.beginPath()
    ctx.arc(3 * scale, 0, 8 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(5 * scale, -3 * scale, 3 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    ctx.save()
    ctx.translate(centerX + 35 * scale, centerY - 50 * scale)
    ctx.scale(1, eyeOpenness)
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(0, 0, 18 * scale, 15 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2d3748'
    ctx.beginPath()
    ctx.arc(3 * scale, 0, 8 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(5 * scale, -3 * scale, 3 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    ctx.strokeStyle = '#8b5a2b'
    ctx.lineWidth = 3 * scale
    ctx.beginPath()
    ctx.moveTo(centerX - 50 * scale, centerY - 75 * scale + browAngle * scale)
    ctx.quadraticCurveTo(centerX - 35 * scale, centerY - 80 * scale + browAngle * scale, centerX - 20 * scale, centerY - 75 * scale + browAngle * scale)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(centerX + 20 * scale, centerY - 75 * scale - browAngle * scale)
    ctx.quadraticCurveTo(centerX + 35 * scale, centerY - 80 * scale - browAngle * scale, centerX + 50 * scale, centerY - 75 * scale - browAngle * scale)
    ctx.stroke()
    
    ctx.fillStyle = '#ffb3b3'
    ctx.globalAlpha = 0.4
    ctx.beginPath()
    ctx.ellipse(centerX - 50 * scale, centerY - 30 * scale, 15 * scale, 10 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(centerX + 50 * scale, centerY - 30 * scale, 15 * scale, 10 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    
    ctx.strokeStyle = '#e53e3e'
    ctx.lineWidth = 3 * scale
    ctx.beginPath()
    if (mouthOpennessVal > 0) {
      ctx.ellipse(centerX, centerY - 10 * scale, 20 * scale, (10 + mouthOpennessVal * 20) * scale, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#c53030'
      ctx.fill()
    } else {
      ctx.arc(centerX, centerY - 10 * scale, 20 * scale, 0.1 + smile * 0.4, Math.PI - 0.1 - smile * 0.4)
      ctx.stroke()
    }
  }

  function animate() {
    const canvas = canvasEl
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    time += 0.016
    drawCharacter(ctx, canvas.width, canvas.height)
    animationId = requestAnimationFrame(animate)
  }

  function autoBlink() {
    if (modelState.currentExpression !== 'blink') {
      const originalExpr = modelState.currentExpression
      setExpression('blink')
      setTimeout(() => {
        setExpression(originalExpr)
      }, 150)
    }
  }

  onMount(() => {
    const canvas = canvasEl
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    animate()
    blinkTimer = window.setInterval(autoBlink, 3000 + Math.random() * 2000)
  })

  onDestroy(() => {
    cancelAnimationFrame(animationId)
    clearInterval(blinkTimer)
  })
</script>

<div class="model-preview">
  <div class="header">
    <h3>虚拟模特预览</h3>
    <div class="status" class:recording={recordingState.isRecording}>
      {recordingState.isRecording ? '🔴 录制中' : '⚪ 待机'}
    </div>
  </div>
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .model-preview {
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

  .status {
    font-size: 12px;
    color: #a0aec0;
    padding: 4px 8px;
    background: #4a5568;
    border-radius: 4px;
  }

  .status.recording {
    color: #fc8181;
    background: #742a2a;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  canvas {
    width: 100%;
    flex: 1;
    background: linear-gradient(180deg, #2b6cb0 0%, #2c5282 50%, #1a365d 100%);
  }
</style>
