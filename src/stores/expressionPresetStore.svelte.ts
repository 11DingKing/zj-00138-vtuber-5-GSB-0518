import type { Expression } from '../types'

export interface ExpressionPreset {
  id: string
  name: string
  emoji: string
  expressionId: string
}

export const expressionPresetState = $state({
  presets: [
    { id: 'preset-happy', name: '开心', emoji: '😊', expressionId: 'happy' },
    { id: 'preset-angry', name: '生气', emoji: '😠', expressionId: 'angry' },
    { id: 'preset-shy', name: '害羞', emoji: '😳', expressionId: 'shy' },
    { id: 'preset-surprised', name: '惊讶', emoji: '😲', expressionId: 'surprised' },
    { id: 'preset-cry', name: '哭泣', emoji: '😭', expressionId: 'cry' },
    { id: 'preset-blink', name: '眨眼', emoji: '😉', expressionId: 'blink' },
    { id: 'preset-cheek', name: '鼓腮', emoji: '😤', expressionId: 'cheek' },
    { id: 'preset-heart', name: '比心', emoji: '🥰', expressionId: 'heart' }
  ] as ExpressionPreset[]
})

export const expressionPlayEvents: Array<(exprId: string) => void> = []

export function onExpressionPlay(listener: (exprId: string) => void) {
  expressionPlayEvents.push(listener)
  return () => {
    const idx = expressionPlayEvents.indexOf(listener)
    if (idx !== -1) expressionPlayEvents.splice(idx, 1)
  }
}

export function playExpression(exprId: string) {
  for (const listener of expressionPlayEvents) {
    listener(exprId)
  }
}

export function reorderPreset(fromIndex: number, toIndex: number) {
  const presets = expressionPresetState.presets
  if (fromIndex < 0 || fromIndex >= presets.length) return
  if (toIndex < 0 || toIndex >= presets.length) return
  const [moved] = presets.splice(fromIndex, 1)
  presets.splice(toIndex, 0, moved)
}

export function addPreset(preset: ExpressionPreset) {
  expressionPresetState.presets.push(preset)
}

export function removePreset(presetId: string) {
  const idx = expressionPresetState.presets.findIndex(p => p.id === presetId)
  if (idx !== -1) {
    expressionPresetState.presets.splice(idx, 1)
  }
}
