export interface Expression {
  id: string;
  name: string;
  shortcut?: string;
  params: Record<string, number>;
}

export interface Pose {
  id: string;
  name: string;
  shortcut?: string;
  params: Record<string, number>;
}

export interface ScriptStage {
  id: string;
  name: string;
  ttsText: string;
  voiceName?: string;
  expressions: string[];
  duration: number;
}

export interface Script {
  id: string;
  name: string;
  stages: ScriptStage[];
  createdAt: number;
}

export interface Danmaku {
  id: string;
  text: string;
  username: string;
  timestamp: number;
}

export interface RecordAction {
  timestamp: number;
  type: "expression" | "pose" | "tts" | "pause" | "resume" | "facialCapture";
  data: unknown;
}

export interface Recording {
  id: string;
  name: string;
  actions: RecordAction[];
  startTime: number;
  endTime: number;
}

export interface FacialCaptureParams {
  smile: number;
  eyeOpenness: number;
  mouthOpenness: number;
  browRaise: number;
  browFurrow: number;
  jawOpen: number;
  lipStretch: number;
  lipPucker: number;
  headTilt: number;
}

export interface ExpressionPreset {
  id: string;
  name: string;
  emoji: string;
}

export interface AppState {
  currentExpression: string | null;
  currentPose: string;
  isPlaying: boolean;
  isPaused: boolean;
  currentScriptId: string | null;
  currentStageIndex: number;
  mouthOpenness: number;
  isRecording: boolean;
  recordingStartTime: number;
  isFacialCapturing: boolean;
  facialCaptureIntensity: number;
  facialCaptureParams: FacialCaptureParams;
  isPlayingBack: boolean;
}
