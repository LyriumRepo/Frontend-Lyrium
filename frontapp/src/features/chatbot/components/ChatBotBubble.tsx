'use client';

import type { ReactNode } from 'react';
import type { ChatBotMessage } from '../types';
import ChatBotAvatar from './ChatBotAvatar';

// ── Inline markdown renderer ────────────────────────────────────────────────
// Handles the subset of markdown that Gemini produces: **bold**, [text](url),
// bare https:// URLs. Returns React nodes — no dangerouslySetInnerHTML.

const LINK_CLASS = 'text-emerald-600 dark:text-emerald-400 underline underline-offset-2 break-all hover:opacity-80 transition-opacity';

function parseInline(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    // Matches: **bold** | [label](url) | bare https:// URL
    const re = /(\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/\S+))/g;
    let cursor = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
        if (m.index > cursor) nodes.push(text.slice(cursor, m.index));

        if (m[2] !== undefined) {
            // **bold**
            nodes.push(<strong key={`${keyPrefix}-b-${m.index}`}>{m[2]}</strong>);
        } else if (m[3] !== undefined) {
            // [label](url)
            nodes.push(
                <a key={`${keyPrefix}-a-${m.index}`} href={m[4]} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                    {m[3]}
                </a>
            );
        } else if (m[5] !== undefined) {
            // bare URL
            nodes.push(
                <a key={`${keyPrefix}-u-${m.index}`} href={m[5]} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                    {m[5]}
                </a>
            );
        }

        cursor = m.index + m[0].length;
    }

    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
}

// Agrupa las líneas en bloques (párrafo o lista de bullets), separados por
// líneas en blanco, para dar más aire entre ideas y mejorar la legibilidad.
type Block = { type: 'text' | 'bullets'; lines: string[] };

function groupBlocks(content: string): Block[] {
    const blocks: Block[] = [];

    for (const line of content.split('\n')) {
        if (line.trim() === '') {
            blocks.push({ type: 'text', lines: [] }); // separador: fuerza nuevo bloque
            continue;
        }

        const type: Block['type'] = /^\s*\*\s/.test(line) ? 'bullets' : 'text';
        const last = blocks[blocks.length - 1];

        if (last && last.type === type && last.lines.length > 0) {
            last.lines.push(line);
        } else {
            blocks.push({ type, lines: [line] });
        }
    }

    return blocks.filter(b => b.lines.length > 0);
}

function renderMarkdown(content: string): ReactNode {
    const blocks = groupBlocks(content);

    return (
        <div className="space-y-2.5">
            {blocks.map((block, bi) => {
                if (block.type === 'bullets') {
                    return (
                        <div key={bi} className="space-y-1">
                            {block.lines.map((line, i) => (
                                <div key={i} className="flex gap-1.5 items-start">
                                    <span className="mt-0.5 flex-shrink-0">•</span>
                                    <span className="text-justify [text-align-last:left]">{parseInline(line.replace(/^\s*\*\s/, ''), `b${bi}-${i}`)}</span>
                                </div>
                            ))}
                        </div>
                    );
                }

                return (
                    <p key={bi} className="text-justify [text-align-last:left]">
                        {block.lines.map((line, i) => (
                            <span key={i}>
                                {parseInline(line, `t${bi}-${i}`)}
                                {i < block.lines.length - 1 && <br />}
                            </span>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}

interface Props {
    message: ChatBotMessage;
    onWhatsAppClick?: () => void;
}

export default function ChatBotBubble({ message, onWhatsAppClick }: Props) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) return null;

    const handleWhatsApp = () => {
        if (!message.whatsappAction) return;
        window.open(message.whatsappAction.url, '_blank', 'noopener,noreferrer');
        onWhatsAppClick?.();
    };

    return (
        <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} ${isUser ? 'animate-bubble-in-right' : 'animate-bubble-in-left'}`}>
            {!isUser && (
                <div className="mt-1 animate-avatar-appear">
                    <ChatBotAvatar size="sm" />
                </div>
            )}

            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${
                    isUser
                        ? 'bg-emerald-700 dark:bg-[var(--brand-green)] text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-800 dark:text-[var(--text-primary)] rounded-bl-md'
                }`}
            >
                {isUser ? message.content : renderMarkdown(message.content)}

                {!isUser && message.whatsappAction && (
                    <button
                        onClick={handleWhatsApp}
                        className="mt-3 flex items-center gap-2 w-full justify-center rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a852] text-white text-xs font-semibold px-3 py-2 transition-colors duration-200 shadow-sm"
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {message.whatsappAction.label}
                    </button>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-amber-700 flex items-center justify-center shadow-sm mt-1 animate-avatar-appear">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
