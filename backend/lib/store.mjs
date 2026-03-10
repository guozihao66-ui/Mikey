import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_PATH = path.resolve(__dirname, '..', 'data', 'store.json')

export function readStore() {
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'))
}

export function writeStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2))
}

export function touchActivity(store, entry) {
  store.activity = store.activity || []
  store.activity.unshift({ id: Date.now(), at: new Date().toISOString(), ...entry })
  store.activity = store.activity.slice(0, 100)
}
