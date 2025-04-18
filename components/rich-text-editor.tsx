import React, { useEffect, useMemo, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import MarkdownIt from 'markdown-it'
import { Button } from './ui/button'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Link as LinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownRichTextEditorProps {
  /** Markdown in */
  content: string
  /** HTML out (you can post‑process to MD if you like) */
  onChange: (html: string) => void
  editable?: boolean
  placeholder?: string
}

export function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing…',
}: MarkdownRichTextEditorProps) {
  // 1) markdown-it parser
  const md = useMemo(() => require('markdown-it')({ html: true }), []);

  content= content.replace(/^```markdown\s*|\s*```$/g, '').trim()

  // 2) turn MD → HTML whenever content changes
  const [htmlContent, setHtmlContent] = useState<string>(() => md.render(content))
  useEffect(() => {
    setHtmlContent(md.render(content))
  }, [content, md])

  // 3) initialize TipTap with that HTML
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: htmlContent,   // load HTML
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[100px] px-4 py-2',
          !editable && 'bg-muted cursor-default'
        ),
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      // 4) emit HTML whenever the doc changes
      onChange(editor.getHTML())
    },
  })

  // 5) if parent MD changes, re‑set the editor’s content
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== htmlContent) {
      editor.commands.setContent(htmlContent)
    }
  }, [htmlContent, editor])

  if (!editor) return null

  // toolbar helpers
  const toggleLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL', prev)
    if (url == null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', !editable && 'bg-muted border-muted')}>
      {editable && (
        <div className="border-b p-2 flex flex-wrap gap-1 bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-accent' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-accent' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-accent' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-accent' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-accent' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLink}
            className={editor.isActive('link') ? 'bg-accent' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} className="min-h-[100px]" />
    </div>
  )
}
