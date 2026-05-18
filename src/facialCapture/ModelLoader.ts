import * as faceapi from "@vladmandic/face-api";

export class ModelLoader {
  private modelsLoaded = false;
  private readonly modelUrl: string;

  constructor(modelUrl: string = "/models") {
    this.modelUrl = modelUrl;
  }

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelUrl),
        faceapi.nets.faceExpressionNet.loadFromUri(this.modelUrl),
      ]);
      this.modelsLoaded = true;
    } catch (err) {
      console.error("加载面部识别模型失败:", err);
      throw err;
    }
  }

  areModelsLoaded(): boolean {
    return this.modelsLoaded;
  }

  reset(): void {
    this.modelsLoaded = false;
  }
}
