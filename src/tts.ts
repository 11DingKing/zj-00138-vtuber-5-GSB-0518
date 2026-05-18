import { setMouthOpenness } from './stores/modelStore.svelte'
import { addRecordAction } from './stores/recordingStore.svelte'

let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let mouthUpdateTimer: number | null = null

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
  }
  return audioContext
}

function updateMouthOpenness() {
  if (!analyser) return
  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(dataArray)
  const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
  setMouthOpenness(Math.min(average / 100, 1))
}

export function speak(text: string, voiceName?: string, onEnd?: () => void) {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported')
    return
  }

  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1
  utterance.pitch = 1
  
  if (voiceName) {
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.name === voiceName)
    if (voice) {
      utterance.voice = voice
    }
  }

  initAudioContext()
  
  utterance.onstart = () => {
    if (!mouthUpdateTimer) {
      mouthUpdateTimer = window.setInterval(updateMouthOpenness, 50)
    }
    addRecordAction('tts', { text, voiceName })
  }
  
  utterance.onend = () => {
    if (mouthUpdateTimer) {
      clearInterval(mouthUpdateTimer)
      mouthUpdateTimer = null
    }
    setMouthOpenness(0)
    onEnd?.()
  }
  
  utterance.onerror = (e) => {
    console.error('TTS error:', e)
    if (mouthUpdateTimer) {
      clearInterval(mouthUpdateTimer)
      mouthUpdateTimer = null
    }
    setMouthOpenness(0)
  }
  
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  window.speechSynthesis.cancel()
  if (mouthUpdateTimer) {
    clearInterval(mouthUpdateTimer)
    mouthUpdateTimer = null
  }
  setMouthOpenness(0)
}

export function pauseSpeaking() {
  window.speechSynthesis.pause()
  addRecordAction('pause', null)
}

export function resumeSpeaking() {
  window.speechSynthesis.resume()
  addRecordAction('resume', null)
}
