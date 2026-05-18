import * as faceapi from "@vladmandic/face-api";
import type { FacialCaptureParams } from "../types";

export class KeypointDetector {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private animationId: number | null = null;
  private isDetecting = false;
  private onParamsUpdate: ((params: FacialCaptureParams) => void) | null = null;
  private onDetectionError: ((error: Error) => void) | null = null;

  setElements(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
  }

  setOnParamsUpdate(callback: (params: FacialCaptureParams) => void): void {
    this.onParamsUpdate = callback;
  }

  setOnDetectionError(callback: (error: Error) => void): void {
    this.onDetectionError = callback;
  }

  startDetection(): void {
    if (!this.videoElement || !this.canvasElement) {
      throw new Error("视频或画布元素未设置");
    }

    this.isDetecting = true;
    this.detectionLoop();
  }

  stopDetection(): void {
    this.isDetecting = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private detectionLoop(): void {
    if (!this.isDetecting || !this.videoElement || !this.canvasElement) return;

    const displaySize = {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
    };
    faceapi.matchDimensions(this.canvasElement, displaySize);

    const detections = faceapi
      .detectAllFaces(this.videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    detections
      .then((results) => {
        const resizedResults = faceapi.resizeResults(results, displaySize);

        if (resizedResults.length > 0) {
          const result = resizedResults[0];
          const expressions = result.expressions;
          const landmarks = result.landmarks;

          const params = this.calculateFacialParams(expressions, landmarks);
          
          if (this.onParamsUpdate) {
            this.onParamsUpdate(params);
          }

          const ctx = this.canvasElement!.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, this.canvasElement!.width, this.canvasElement!.height);
            faceapi.draw.drawDetections(this.canvasElement!, resizedResults);
            faceapi.draw.drawFaceLandmarks(this.canvasElement!, resizedResults);
          }
        }

        this.animationId = requestAnimationFrame(() => this.detectionLoop());
      })
      .catch((err) => {
        console.error("面部检测错误:", err);
        if (this.onDetectionError) {
          this.onDetectionError(err);
        }
        this.animationId = requestAnimationFrame(() => this.detectionLoop());
      });
  }

  private calculateFacialParams(
    expressions: faceapi.FaceExpressions,
    landmarks: faceapi.FaceLandmarks68,
  ): FacialCaptureParams {
    const smile = expressions.happy as number;
    const eyeOpenness = 1 - (expressions.closedEyes as number) * 1.5;
    const mouthOpenness = (expressions.mouthOpen as number) * 0.8;
    const browRaise = expressions.surprised as number;
    const browFurrow = expressions.angry as number;
    const jawOpen = expressions.mouthOpen as number;
    const lipStretch = Math.max(expressions.disgusted as number, smile * 0.5);
    const lipPucker = 0;
    const headTilt = this.calculateHeadTilt(landmarks);

    return {
      smile: Math.min(1, Math.max(0, smile)),
      eyeOpenness: Math.min(1, Math.max(0, eyeOpenness)),
      mouthOpenness: Math.min(1, Math.max(0, mouthOpenness)),
      browRaise: Math.min(1, Math.max(0, browRaise)),
      browFurrow: Math.min(1, Math.max(0, browFurrow)),
      jawOpen: Math.min(1, Math.max(0, jawOpen)),
      lipStretch: Math.min(1, Math.max(0, lipStretch)),
      lipPucker: Math.min(1, Math.max(0, lipPucker)),
      headTilt: Math.min(1, Math.max(-1, headTilt)),
    };
  }

  private calculateHeadTilt(landmarks: faceapi.FaceLandmarks68): number {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEyeCenter = {
      x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
    };

    const rightEyeCenter = {
      x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
    };

    const dy = rightEyeCenter.y - leftEyeCenter.y;
    const dx = rightEyeCenter.x - leftEyeCenter.x;
    const angle = Math.atan2(dy, dx);

    return angle / Math.PI;
  }

  isRunning(): boolean {
    return this.isDetecting;
  }
}
