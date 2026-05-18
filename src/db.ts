import { openDB, type DBSchema } from 'idb'
import type { Expression, Pose, Script, Recording } from './types'

interface VtuberDB extends DBSchema {
  expressions: {
    key: string
    value: Expression
  }
  poses: {
    key: string
    value: Pose
  }
  scripts: {
    key: string
    value: Script
  }
  recordings: {
    key: string
    value: Recording
  }
  settings: {
    key: string
    value: unknown
  }
}

const DB_VERSION = 1
const DB_NAME = 'vtuber-console'

export const dbPromise = openDB<VtuberDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('expressions')) {
      db.createObjectStore('expressions', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('poses')) {
      db.createObjectStore('poses', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('scripts')) {
      db.createObjectStore('scripts', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('recordings')) {
      db.createObjectStore('recordings', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings')
    }
  }
})

export async function getAllExpressions() {
  return (await dbPromise).getAll('expressions')
}

export async function saveExpression(expr: Expression) {
  return (await dbPromise).put('expressions', expr)
}

export async function deleteExpression(id: string) {
  return (await dbPromise).delete('expressions', id)
}

export async function getAllPoses() {
  return (await dbPromise).getAll('poses')
}

export async function savePose(pose: Pose) {
  return (await dbPromise).put('poses', pose)
}

export async function deletePose(id: string) {
  return (await dbPromise).delete('poses', id)
}

export async function getAllScripts() {
  return (await dbPromise).getAll('scripts')
}

export async function saveScript(script: Script) {
  return (await dbPromise).put('scripts', script)
}

export async function deleteScript(id: string) {
  return (await dbPromise).delete('scripts', id)
}

export async function getAllRecordings() {
  return (await dbPromise).getAll('recordings')
}

export async function saveRecording(recording: Recording) {
  return (await dbPromise).put('recordings', recording)
}

export async function deleteRecording(id: string) {
  return (await dbPromise).delete('recordings', id)
}
