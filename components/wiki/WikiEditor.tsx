'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'

interface WikiEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
}

const TOOLBAR_BUTTONS = [
  { label: 'B',   action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBold().run(),        active: (e: ReturnType<typeof useEditor>) => e?.isActive('bold') ?? false },
  { label: 'I',   action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleItalic().run(),      active: (e: ReturnType<typeof useEditor>) => e?.isActive('italic') ?? false },
  { label: 'H1',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleHeading({ level: 1 }).run(), active: (e: ReturnType<typeof useEditor>) => e?.isActive('heading', { level: 1 }) ?? false },
  { label: 'H2',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleHeading({ level: 2 }).run(), active: (e: ReturnType<typeof useEditor>) => e?.isActive('heading', { level: 2 }) ?? false },
  { label: '• ',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBulletList().run(),   active: (e: ReturnType<typeof useEditor>) => e?.isActive('bulletList') ?? false },
  { label: '1.',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleOrderedList().run(),  active: (e: ReturnType<typeof useEditor>) => e?.isActive('orderedList') ?? false },
  { label: '"',   action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleBlockquote().run(),   active: (e: ReturnType<typeof useEditor>) => e?.isActive('blockquote') ?? false },
  { label: '</>',  action: (e: ReturnType<typeof useEditor>) => e?.chain().focus().toggleCodeBlock().run(),   active: (e: ReturnType<typeof useEditor>) => e?.isActive('codeBlock') ?? false },
]

export function WikiEditor({ content = '', onChange, placeholder = 'Start writing…' }: WikiEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
  })

  return (
    <div className="border border-seeper-border/40 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-seeper-border/40 bg-[var(--color-raised)] flex-wrap">
        {TOOLBAR_BUTTONS.map(btn => (
          <button
            key={btn.label}
            type="button"
            onClick={() => btn.action(editor)}
            className={cn(
              'px-2 py-1 rounded text-xs font-mono transition-all duration-150',
              btn.active(editor)
                ? 'bg-plasma text-white'
                : 'text-[var(--color-subtext)] hover:bg-[var(--color-surface)]'
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm prose-invert max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]"
      />
    </div>
  )
}
