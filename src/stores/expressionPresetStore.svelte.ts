import type { ExpressionPreset } from '../types'

const defaultPresets: ExpressionPreset[] = [
  { id: 'happy', name: '开心', emoji: '😊' },
  { id: 'angry', name: '生气', emoji: '😠' },
  { id: 'shy', name: '害羞', emoji: '😳' },
  { id: 'surprised', name: '惊讶', emoji: '😮' },
  { id: 'crying', name: '哭泣', emoji: '😢' },
  { id: 'blink', name: '眨眼', emoji: '😉' },
  { id: 'pout', name: '鼓腮', emoji: '😗' },
  { id: 'heart', name: '比心', emoji: '🥰' }
]

export const expressionPresetState = $state({
  presets: [...defaultPresets] as ExpressionPreset[],
  currentPresetId: null as string | null
})

type ExpressionListener = (preset: ExpressionPreset) => void
const listeners: Set<ExpressionListener> = new Set()

export function onExpressionPlay(listener: ExpressionListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function playExpression(presetId: string) {
  const preset = expressionPresetState.presets.find(p => p.id === presetId)
  if (!preset) return

  expressionPresetState.currentPresetId = presetId
  listeners.forEach(listener => listener(preset))

  setTimeout(() => {
    if (expressionPresetState.currentPresetId === presetId) {
      expressionPresetState.currentPresetId = null
    }
  }, 2000)
}

export function reorderPresets(fromIndex: number, toIndex: number) {
  const presets = expressionPresetState.presets
  const [moved] = presets.splice(fromIndex, 1)
  presets.splice(toIndex, 0, moved)
}

export function resetPresets() {
  expressionPresetState.presets = [...defaultPresets]
}
