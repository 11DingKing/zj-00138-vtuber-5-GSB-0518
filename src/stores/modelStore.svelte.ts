import type { Expression, Pose } from '../types'

export const modelState = $state({
  currentExpression: null as string | null,
  currentPose: 'natural' as string,
  mouthOpenness: 0,
  expressions: [] as Expression[],
  poses: [] as Pose[],
  availableVoices: [] as SpeechSynthesisVoice[],
  isPlayingBack: false
})

export function setExpression(expressionId: string | null) {
  modelState.currentExpression = expressionId
}

export function setPose(poseId: string) {
  modelState.currentPose = poseId
}

export function setMouthOpenness(openness: number) {
  modelState.mouthOpenness = Math.max(0, Math.min(1, openness))
}

export function initVoices() {
  const loadVoices = () => {
    modelState.availableVoices.length = 0
    modelState.availableVoices.push(...window.speechSynthesis.getVoices())
  }
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

export function startPlaybackMode() {
  modelState.isPlayingBack = true
}

export function stopPlaybackMode() {
  modelState.isPlayingBack = false
}
