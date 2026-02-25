"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Code,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon
} from 'lucide-react'
import { Button } from './button'

interface TiptapEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    const items = [
        {
            icon: <Bold className="h-4 w-4" />,
            title: 'Bold',
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: () => editor.isActive('bold'),
        },
        {
            icon: <Italic className="h-4 w-4" />,
            title: 'Italic',
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: () => editor.isActive('italic'),
        },
        {
            icon: <UnderlineIcon className="h-4 w-4" />,
            title: 'Underline',
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: () => editor.isActive('underline'),
        },
        {
            type: 'divider',
        },
        {
            icon: <Heading1 className="h-4 w-4" />,
            title: 'Heading 1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: () => editor.isActive('heading', { level: 1 }),
        },
        {
            icon: <Heading2 className="h-4 w-4" />,
            title: 'Heading 2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: () => editor.isActive('heading', { level: 2 }),
        },
        {
            icon: <Heading3 className="h-4 w-4" />,
            title: 'Heading 3',
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: () => editor.isActive('heading', { level: 3 }),
        },
        {
            type: 'divider',
        },
        {
            icon: <List className="h-4 w-4" />,
            title: 'Bullet List',
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: () => editor.isActive('bulletList'),
        },
        {
            icon: <ListOrdered className="h-4 w-4" />,
            title: 'Ordered List',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: () => editor.isActive('orderedList'),
        },
        {
            type: 'divider',
        },
        {
            icon: <Quote className="h-4 w-4" />,
            title: 'Blockquote',
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: () => editor.isActive('blockquote'),
        },
        {
            icon: <Code className="h-4 w-4" />,
            title: 'Code Block',
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: () => editor.isActive('codeBlock'),
        },
        {
            icon: <LinkIcon className="h-4 w-4" />,
            title: 'Link',
            action: setLink,
            isActive: () => editor.isActive('link'),
        },
        {
            type: 'divider',
        },
        {
            icon: <Undo className="h-4 w-4" />,
            title: 'Undo',
            action: () => editor.chain().focus().undo().run(),
        },
        {
            icon: <Redo className="h-4 w-4" />,
            title: 'Redo',
            action: () => editor.chain().focus().redo().run(),
        },
    ]

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 border-b border-muted-foreground/20 rounded-t-xl sticky top-0 z-20 backdrop-blur-md">
            {items.map((item, index) => (
                item.type === 'divider' ? (
                    <div key={`divider-${index}`} className="w-[1px] h-8 bg-muted-foreground/20 mx-1" />
                ) : (
                    <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault()
                            item.action?.()
                        }}
                        className={`h-8 w-8 p-0 rounded-md transition-all ${item.isActive?.()
                            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                            : 'hover:bg-primary/10 hover:text-primary'
                            }`}
                        title={item.title}
                    >
                        {item.icon}
                    </Button>
                )
            ))}
        </div>
    )
}

export function TiptapEditor({ content, onChange, placeholder = 'Empieza a escribir aquí...' }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline font-bold cursor-pointer',
                },
            }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm md:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[400px] p-6 text-foreground leading-relaxed',
            },
        },
    })

    // Update content if it changes externally (e.g. on initial load)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    return (
        <div className="w-full border border-muted-foreground/20 rounded-xl bg-background/50 overflow-hidden group focus-within:border-primary/50 transition-colors shadow-sm">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <div className="bg-muted/30 px-4 py-2 border-t border-muted-foreground/10 text-[10px] text-muted-foreground flex justify-between items-center font-medium">
                <span>{editor?.storage.smth?.words || 0} palabras</span>
                <span className="opacity-60 italic">Autoguardado local activo</span>
            </div>
        </div>
    )
}

