import { ModelLoader } from "./facialCapture/ModelLoader";
import { VideoStreamProvider } from "./facialCapture/VideoStreamProvider";
import { KeypointDetector } from "./facialCapture/KeypointDetector";
import { RecordWriter } from "./facialCapture/RecordWriter";
import { facialCaptureState, startFacialCapture, stopFacialCapture, updateFacialCaptureParams } from "./stores/facialCaptureStore.svelte";
import { addRecordAction, recordingState } from "./stores/recordingStore.svelte";
import type { FacialCaptureParams } from "./types";

const modelLoader = new ModelLoader();
const videoStreamProvider = new VideoStreamProvider();
const keypointDetector = new KeypointDetector();
const recordWriter = new RecordWriter();

recordWriter.setOnRecordAction(addRecordAction);

keypointDetector.setOnParamsUpdate((params: FacialCaptureParams) => {
  updateFacialCaptureParams(params);
  if (recordingState.isRecording) {
    recordWriter.writeFacialCapture(params);
  }
});

keypointDetector.setOnDetectionError((error: Error) => {
  console.error("面部检测错误:", error);
});

export async function loadModels(): Promise<void> {
  await modelLoader.loadModels();
}

export async function startCapture(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement,
): Promise<void> {
  if (!modelLoader.areModelsLoaded()) {
    await modelLoader.loadModels();
  }

  await videoStreamProvider.startStream(videoElement);
  
  keypointDetector.setElements(videoElement, canvasElement);
  keypointDetector.startDetection();
  
  startFacialCapture();
  recordWriter.setRecordingState(recordingState.isRecording);
}

export function stopCapture(): void {
  keypointDetector.stopDetection();
  videoStreamProvider.stopStream();
  stopFacialCapture();
  recordWriter.setRecordingState(false);
}

export function isCapturing(): boolean {
  return facialCaptureState.isFacialCapturing;
}

export function updateRecordingState(recording: boolean): void {
  recordWriter.setRecordingState(recording);
}

export { ModelLoader, VideoStreamProvider, KeypointDetector, RecordWriter };
