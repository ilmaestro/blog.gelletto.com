import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { create, list, remove, update, type Note } from './store'
import './notes.css'

type ConfirmState = { id: string; name: string } | null

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(() => list())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  // Derived from state — if the note disappears from the store,
  // selected becomes undefined and the empty state renders.
  const selected = notes.find((n) => n.id === selectedId)

  const refresh = () => setNotes(list())

  const startEdit = (note: Note) => {
    setDraftName(note.name)
    setDraftContent(note.content)
    setEditing(true)
    setPreview(false)
  }

  const handleNew = () => {
    const note = create('Untitled', '')
    refresh()
    setSelectedId(note.id)
    startEdit(note)
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setEditing(false)
    setPreview(false)
  }

  const handleSave = () => {
    if (!selectedId) return
    update(selectedId, { name: draftName.trim() || 'Untitled', content: draftContent })
    refresh()
    setEditing(false)
  }

  const handleDelete = () => {
    if (!confirm) return
    remove(confirm.id)
    setConfirm(null)
    if (selectedId === confirm.id) {
      setSelectedId(null)
      setEditing(false)
    }
    refresh()
  }

  const dirty =
    editing &&
    selected !== undefined &&
    (draftName !== selected.name || draftContent !== selected.content)

  return (
    <div className="notes">
      <nav className="site-nav">
        <a href="#/">Home</a>
        <a href="#/notes">Notes</a>
        <a href="#/puppies">Puppies</a>
      </nav>

      <aside className="notes__sidebar">
        <button className="notes__new" type="button" onClick={handleNew}>
          + New note
        </button>
        <ul className="notes__list">
          {notes.map((note) => (
            <li key={note.id}>
              <div
                className={`notes__item${note.id === selectedId ? ' notes__item--active' : ''}`}
              >
                <button
                  type="button"
                  className="notes__item-name"
                  onClick={() => handleSelect(note.id)}
                  title={note.name}
                >
                  {note.name}
                </button>
                <button
                  type="button"
                  className="notes__item-delete"
                  aria-label={`Delete ${note.name}`}
                  onClick={() => setConfirm({ id: note.id, name: note.name })}
                >
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <main className="notes__main">
        {!selected ? (
          <p className="notes__empty">
            {notes.length === 0
              ? 'No notes yet. Create one to get started.'
              : 'Select a note from the sidebar.'}
          </p>
        ) : !editing ? (
          <>
            <header className="notes__header">
              <h1 className="notes__title">{selected.name}</h1>
              <button
                type="button"
                className="notes__btn"
                onClick={() => startEdit(selected)}
              >
                Edit
              </button>
            </header>
            <div className="notes__content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selected.content}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <>
            <header className="notes__header">
              <input
                className="notes__name-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Note name"
                autoFocus
              />
              <div className="notes__actions">
                <label className="notes__preview-toggle">
                  <input
                    type="checkbox"
                    checked={preview}
                    onChange={(e) => setPreview(e.target.checked)}
                  />
                  Preview
                </label>
                {dirty && <span className="notes__dirty">Unsaved changes</span>}
                <button
                  type="button"
                  className="notes__btn"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="notes__btn notes__btn--primary"
                  onClick={handleSave}
                  disabled={!dirty}
                >
                  Save
                </button>
              </div>
            </header>
            {preview ? (
              <div className="notes__content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {draftContent}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                className="notes__editor"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Write in Markdown..."
                spellCheck={false}
              />
            )}
          </>
        )}
      </main>

      {confirm && (
        <div
          className="notes__overlay"
          role="presentation"
          onClick={() => setConfirm(null)}
        >
          <div
            className="notes__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm delete"
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              Delete <strong>{confirm.name}</strong>? This can't be undone.
            </p>
            <div className="notes__dialog-actions">
              <button
                type="button"
                className="notes__btn"
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="notes__btn notes__btn--danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
