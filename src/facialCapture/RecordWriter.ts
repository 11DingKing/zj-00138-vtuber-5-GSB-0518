import type { FacialCaptureParams, RecordAction } from "../types";

export class RecordWriter {
  private onRecordAction: ((type: RecordAction['type'], data: unknown) => void) | null = null;
  private isRecording = false;

  setOnRecordAction(callback: (type: RecordAction['type'], data: unknown) => void): void {
    this.onRecordAction = callback;
  }

  setRecordingState(recording: boolean): void {
    this.isRecording = recording;
  }

  writeFacialCapture(params: FacialCaptureParams): void {
    if (!this.isRecording || !this.onRecordAction) return;
    
    this.onRecordAction("facialCapture", { ...params });
  }

  writeExpression(expressionId: string): void {
    if (!this.isRecording || !this.onRecordAction) return;
    
    this.onRecordAction("expression", { expressionId });
  }

  writePose(poseId: string): void {
    if (!this.isRecording || !this.onRecordAction) return;
    
    this.onRecordAction("pose", { poseId });
  }

  writeTts(text: string, voiceName?: string): void {
    if (!this.isRecording || !this.onRecordAction) return;
    
    this.onRecordAction("tts", { text, voiceName });
  }

  writePause(): void {
    if (!this.isRecording || !this.onRecordAction) return;
    
    this.onRecordAction("pause", {});
  }

  writeResume(): void {
    if (!this.isRecording || !this.onRecordAction) return;
    
    this.onRecordAction("resume", {});
  }
}
