import type { Script } from '../types'

export const scriptState = $state({
  isPlaying: false,
  isPaused: false,
  currentScriptId: null as string | null,
  currentStageIndex: 0,
  scripts: [] as Script[]
})

export function startPlayback() {
  scriptState.isPlaying = true
  scriptState.isPaused = false
}

export function pausePlayback() {
  scriptState.isPaused = true
}

export function resumePlayback() {
  scriptState.isPaused = false
}

export function stopPlayback() {
  scriptState.isPlaying = false
  scriptState.isPaused = false
  scriptState.currentStageIndex = 0
}

export function setCurrentScript(scriptId: string | null) {
  scriptState.currentScriptId = scriptId
  scriptState.currentStageIndex = 0
}

export function nextStage() {
  scriptState.currentStageIndex++
}
