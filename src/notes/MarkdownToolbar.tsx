import './MarkdownToolbar.css'

type ToolbarAction =
  | { type: 'wrap'; prefix: string; suffix: string }
  | { type: 'prefix'; prefix: string }
  | { type: 'insert'; text: string }

interface ToolbarButton {
  label: string
  title: string
  action: ToolbarAction
}

const buttons: ToolbarButton[] = [
  { label: 'B', title: 'Bold', action: { type: 'wrap', prefix: '**', suffix: '**' } },
  { label: 'I', title: 'Italic', action: { type: 'wrap', prefix: '*', suffix: '*' } },
  { label: 'S', title: 'Strikethrough', action: { type: 'wrap', prefix: '~~', suffix: '~~' } },
  { label: 'H1', title: 'Heading 1', action: { type: 'prefix', prefix: '# ' } },
  { label: 'H2', title: 'Heading 2', action: { type: 'prefix', prefix: '## ' } },
  { label: '•', title: 'Unordered list', action: { type: 'prefix', prefix: '- ' } },
  { label: '1.', title: 'Ordered list', action: { type: 'prefix', prefix: '1. ' } },
  { label: '☐', title: 'Checklist', action: { type: 'prefix', prefix: '- [ ] ' } },
  { label: '{}', title: 'Code block', action: { type: 'wrap', prefix: '```\n', suffix: '\n```' } },
  { label: '">', title: 'Blockquote', action: { type: 'prefix', prefix: '> ' } },
  { label: '—', title: 'Horizontal rule', action: { type: 'insert', text: '\n---\n' } },
  { label: '🔗', title: 'Link', action: { type: 'wrap', prefix: '[', suffix: '](url)' } },
  { label: '🖼️', title: 'Image', action: { type: 'wrap', prefix: '![', suffix: '](url)' } },
]

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onInsert: (text: string, start: number, end: number) => void
}

export default function MarkdownToolbar({ textareaRef, onInsert }: Props) {
  const handleClick = (button: ToolbarButton) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value
    const selected = value.slice(start, end)

    let newText: string
    let newStart: number
    let newEnd: number

    if (button.action.type === 'insert') {
      newText = button.action.text
      onInsert(newText, start, end)
      return
    }

    if (button.action.type === 'prefix') {
      const { prefix } = button.action
      if (selected) {
        // Wrap each line with the prefix
        const lines = selected.split('\n')
        const prefixed = lines.map((line) => prefix + line).join('\n')
        newText = prefixed
        newStart = start
        newEnd = start + newText.length
      } else {
        // Insert prefix and place cursor after it
        newText = prefix
        newStart = start + prefix.length
        newEnd = newStart
      }
      onInsert(newText, newStart, newEnd)
      return
    }

    if (button.action.type === 'wrap') {
      const { prefix, suffix } = button.action
      if (selected) {
        newText = prefix + selected + suffix
        newStart = start
        newEnd = start + newText.length
      } else {
        newText = prefix + suffix
        newStart = start + prefix.length
        newEnd = newStart
      }
      onInsert(newText, newStart, newEnd)
      return
    }
  }

  return (
    <div className="markdown-toolbar" role="toolbar" aria-label="Markdown formatting">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          className="markdown-toolbar__btn"
          title={btn.title}
          onClick={() => handleClick(btn)}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
