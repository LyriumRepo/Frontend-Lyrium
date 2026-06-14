'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback } from 'react';
import {
    Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
    Quote, Link as LinkIcon, Image, Pilcrow, Undo, Redo,
} from 'lucide-react';

interface BlogEditorProps {
    content: string;
    onChange: (html: string) => void;
    onUploadImage?: (file: File) => Promise<string>;
    placeholder?: string;
}

export function BlogEditor({ content, onChange, onUploadImage, placeholder }: BlogEditorProps) {
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            ImageExtension.configure({
                allowBase64: false,
                inline: false,
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Comienza a escribir...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            handleDrop: (view, event) => {
                const files = event.dataTransfer?.files;
                if (files && files.length > 0 && onUploadImage) {
                    event.preventDefault();
                    const file = files[0];
                    if (file.type.startsWith('image/')) {
                        onUploadImage(file).then(url => {
                            editor.chain().focus().setImage({ src: url }).run();
                        });
                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of Array.from(items)) {
                        if (item.type.startsWith('image/') && onUploadImage) {
                            event.preventDefault();
                            const file = item.getAsFile();
                            if (file) {
                                onUploadImage(file).then(url => {
                                    editor.chain().focus().setImage({ src: url }).run();
                                });
                            }
                            return true;
                        }
                    }
                }
                return false;
            },
        },
    });

    const handleImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (file && onUploadImage) {
                const url = await onUploadImage(file);
                editor?.chain().focus().setImage({ src: url }).run();
            }
        };
        input.click();
    }, [editor, onUploadImage]);

    const setLink = useCallback(() => {
        if (!editor) return;
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    }, [editor, linkUrl]);

    if (!editor) return null;

    const ToolButton = ({ onClick, active, children, title }: any) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-lg transition ${active ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="flex flex-wrap gap-0.5 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bg-secondary)]">
                <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 className="w-4 h-4" /></ToolButton>
                <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 className="w-4 h-4" /></ToolButton>
                <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 className="w-4 h-4" /></ToolButton>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />
                <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita"><Bold className="w-4 h-4" /></ToolButton>
                <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálica"><Italic className="w-4 h-4" /></ToolButton>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />
                <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista"><List className="w-4 h-4" /></ToolButton>
                <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista ordenada"><ListOrdered className="w-4 h-4" /></ToolButton>
                <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita"><Quote className="w-4 h-4" /></ToolButton>
                <div className="w-px h-6 bg-gray-200 dark:border-gray-700 mx-1 self-center" />
                <ToolButton onClick={() => setShowLinkInput(!showLinkInput)} active={editor.isActive('link')} title="Link"><LinkIcon className="w-4 h-4" /></ToolButton>
                <ToolButton onClick={handleImageUpload} active={false} title="Imagen"><Image className="w-4 h-4" /></ToolButton>
                <div className="w-px h-6 bg-gray-200 dark:border-gray-700 mx-1 self-center" />
                <ToolButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Deshacer"><Undo className="w-4 h-4" /></ToolButton>
                <ToolButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Rehacer"><Redo className="w-4 h-4" /></ToolButton>
            </div>

            {showLinkInput && (
                <div className="flex gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bg-secondary)]">
                    <input
                        type="text"
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setLink(); } }}
                    />
                    <button onClick={setLink} className="px-3 py-1.5 text-xs font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">Aplicar</button>
                    <button onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Quitar</button>
                </div>
            )}

            <EditorContent
                editor={editor}
                className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror_p]:my-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gray-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-gray-500"
            />
        </div>
    );
}
