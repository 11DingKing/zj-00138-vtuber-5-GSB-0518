import type { FacialCaptureParams } from '../types'

export const facialCaptureState = $state({
  isFacialCapturing: false,
  facialCaptureIntensity: 1,
  facialCaptureParams: {
    smile: 0,
    eyeOpenness: 1,
    mouthOpenness: 0,
    browRaise: 0,
    browFurrow: 0,
    jawOpen: 0,
    lipStretch: 0,
    lipPucker: 0,
    headTilt: 0
  } as FacialCaptureParams
})

export function startFacialCapture() {
  facialCaptureState.isFacialCapturing = true
}

export function stopFacialCapture() {
  facialCaptureState.isFacialCapturing = false
  resetFacialCaptureParams()
}

export function updateFacialCaptureParams(params: Partial<FacialCaptureParams>) {
  Object.assign(facialCaptureState.facialCaptureParams, params)
}

export function resetFacialCaptureParams() {
  facialCaptureState.facialCaptureParams.smile = 0
  facialCaptureState.facialCaptureParams.eyeOpenness = 1
  facialCaptureState.facialCaptureParams.mouthOpenness = 0
  facialCaptureState.facialCaptureParams.browRaise = 0
  facialCaptureState.facialCaptureParams.browFurrow = 0
  facialCaptureState.facialCaptureParams.jawOpen = 0
  facialCaptureState.facialCaptureParams.lipStretch = 0
  facialCaptureState.facialCaptureParams.lipPucker = 0
  facialCaptureState.facialCaptureParams.headTilt = 0
}

export function setFacialCaptureIntensity(intensity: number) {
  facialCaptureState.facialCaptureIntensity = Math.max(0, Math.min(2, intensity))
}
