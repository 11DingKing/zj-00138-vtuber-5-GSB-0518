import type { AppState, Expression, Pose, Script, Recording, Danmaku, RecordAction } from './types'

export const appState = $state<AppState>({
  currentExpression: null,
  currentPose: 'natural',
  isPlaying: false,
  isPaused: false,
  currentScriptId: null,
  currentStageIndex: 0,
  mouthOpenness: 0,
  isRecording: false,
  recordingStartTime: 0,
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
  },
  isPlayingBack: false
})

export const expressions = $state<Expression[]>([])
export const poses = $state<Pose[]>([])
export const scripts = $state<Script[]>([])
export const recordings = $state<Recording[]>([])
export const danmakus = $state<Danmaku[]>([])
export const recordActions = $state<RecordAction[]>([])

export const availableVoices = $state<SpeechSynthesisVoice[]>([])

export function initVoices() {
  const loadVoices = () => {
    availableVoices.length = 0
    availableVoices.push(...window.speechSynthesis.getVoices())
  }
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

export function addRecordAction(type: RecordAction['type'], data: unknown) {
  if (!appState.isRecording) return
  recordActions.push({
    timestamp: Date.now() - appState.recordingStartTime,
    type,
    data
  })
}

export function startRecording() {
  appState.isRecording = true
  appState.recordingStartTime = Date.now()
  recordActions.length = 0
}

export function stopRecording() {
  appState.isRecording = false
}

let danmakuTimer: number | null = null
const fakeUsernames = ['小明', '小红', '阿强', '阿珍', '路人甲', '观众乙', '铁粉丙', '新粉丝', '老观众', '神秘人']
const fakeMessages = [
  '主播好可爱！',
  '这个产品多少钱？',
  '有优惠吗？',
  '什么时候发货？',
  '主播声音好好听',
  '已下单！',
  '求链接',
  '太好看了吧',
  '买买买！',
  '主播辛苦了',
  '求翻牌',
  '还有库存吗？',
  '颜色好漂亮',
  '质量怎么样？',
  '主播今天好美'
]

export function startDanmakuSimulation() {
  if (danmakuTimer) return
  danmakuTimer = window.setInterval(() => {
    if (danmakus.length > 20) {
      danmakus.shift()
    }
    danmakus.push({
      id: 'danmaku-' + Date.now() + '-' + Math.random(),
      username: fakeUsernames[Math.floor(Math.random() * fakeUsernames.length)],
      text: fakeMessages[Math.floor(Math.random() * fakeMessages.length)],
      timestamp: Date.now()
    })
  }, 2000 + Math.random() * 3000)
}

export function stopDanmakuSimulation() {
  if (danmakuTimer) {
    clearInterval(danmakuTimer)
    danmakuTimer = null
  }
}
