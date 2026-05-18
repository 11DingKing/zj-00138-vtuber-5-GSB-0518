import type { ExpressionPreset } from '../types'

export const defaultPresets: ExpressionPreset[] = [
  { id: 'happy', name: '开心', emoji: '😊' },
  { id: 'angry', name: '生气', emoji: '😠' },
  { id: 'shy', name: '害羞', emoji: '😳' },
  { id: 'surprised', name: '惊讶', emoji: '😲' },
  { id: 'crying', name: '哭泣', emoji: '😢' },
  { id: 'blink', name: '眨眼', emoji: '😉' },
  { id: 'puff', name: '鼓腮', emoji: '😤' },
  { id: 'heart', name: '比心', emoji: '🫶' }
]

export const presetState = $state({
  presets: [...defaultPresets] as ExpressionPreset[],
  activePresetId: null as string | null
})

export function playPreset(presetId: string) {
  const preset = presetState.presets.find(p => p.id === presetId)
  if (!preset) return
  presetState.activePresetId = presetId
  window.dispatchEvent(new CustomEvent('expression-preset', { detail: preset }))
  setTimeout(() => {
    if (presetState.activePresetId === presetId) {
      presetState.activePresetId = null
    }
  }, 1500)
}

export function reorderPresets(fromIndex: number, toIndex: number) {
  const [moved] = presetState.presets.splice(fromIndex, 1)
  presetState.presets.splice(toIndex, 0, moved)
}
