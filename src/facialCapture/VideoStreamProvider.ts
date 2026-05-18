export class VideoStreamProvider {
  private videoElement: HTMLVideoElement | null = null;

  async startStream(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      this.videoElement.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (this.videoElement) {
          this.videoElement.onloadedmetadata = () => resolve();
        }
      });

      this.videoElement.play();
    } catch (err) {
      console.error("启动摄像头失败:", err);
      throw err;
    }
  }

  stopStream(): void {
    if (this.videoElement) {
      const stream = this.videoElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      this.videoElement.srcObject = null;
    }
    this.videoElement = null;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  isStreaming(): boolean {
    return this.videoElement !== null && this.videoElement.srcObject !== null;
  }
}
