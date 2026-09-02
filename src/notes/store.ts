// localStorage-backed notes store.
// Notes are stored as a single JSON array under STORAGE_KEY.

export type Note = {
  id: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'gelletto-notes-v1'

function readAll(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Note[]
  } catch {
    return []
  }
}

function writeAll(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

function now(): string {
  return new Date().toISOString()
}

/** All notes, most recently updated first. */
export function list(): Note[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function get(id: string): Note | undefined {
  return readAll().find((n) => n.id === id)
}

export function create(name = 'Untitled', content = ''): Note {
  const timestamp = now()
  const note: Note = {
    id: crypto.randomUUID(),
    name,
    content,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  writeAll([...readAll(), note])
  return note
}

export function update(
  id: string,
  fields: Partial<Pick<Note, 'name' | 'content'>>,
): Note | undefined {
  const notes = readAll()
  const index = notes.findIndex((n) => n.id === id)
  if (index === -1) return undefined
  notes[index] = { ...notes[index], ...fields, updatedAt: now() }
  writeAll(notes)
  return notes[index]
}

export function remove(id: string): void {
  writeAll(readAll().filter((n) => n.id !== id))
}
