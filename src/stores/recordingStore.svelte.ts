import type { Recording, RecordAction } from '../types'

export const recordingState = $state({
  isRecording: false,
  recordingStartTime: 0,
  recordings: [] as Recording[],
  recordActions: [] as RecordAction[]
})

export function addRecordAction(type: RecordAction['type'], data: unknown) {
  if (!recordingState.isRecording) return
  recordingState.recordActions.push({
    timestamp: Date.now() - recordingState.recordingStartTime,
    type,
    data
  })
}

export function startRecording() {
  recordingState.isRecording = true
  recordingState.recordingStartTime = Date.now()
  recordingState.recordActions.length = 0
}

export function stopRecording() {
  recordingState.isRecording = false
}

export function saveRecording(name: string) {
  if (recordingState.recordActions.length === 0) return
  
  const recording: Recording = {
    id: 'recording-' + Date.now(),
    name,
    actions: [...recordingState.recordActions],
    startTime: recordingState.recordingStartTime,
    endTime: Date.now()
  }
  
  recordingState.recordings.push(recording)
  return recording
}

export function deleteRecording(recordingId: string) {
  const index = recordingState.recordings.findIndex(r => r.id === recordingId)
  if (index !== -1) {
    recordingState.recordings.splice(index, 1)
  }
}

export function clearRecordings() {
  recordingState.recordings.length = 0
}
