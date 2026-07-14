'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useChatBot } from '../hooks/useChatBot';
import { useChatBotTooltip } from '../hooks/useChatBotTooltip';
import ChatBotPanel from './ChatBotPanel';
import LogoLyrium from '@/components/LogoLyrium';

const STORAGE_KEY = 'lyrium-chatbot-pos';
const DRAG_THRESHOLD = 5;

function loadPosition() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const p = JSON.parse(raw);
        if (typeof p.x === 'number' && typeof p.y === 'number') return p;
    } catch {}
    return null;
}

function savePosition(x: number, y: number) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y })); } catch {}
}

export default function ChatBotWidget() {
    const pathname = usePathname();
    if (pathname === '/login') return null;

    const {
        isOpen, isMinimized, messages, isTyping,
        toggle, minimize, restore, close, sendMessage, addBotResponse, clearHistory,
        handleWhatsAppClick,
    } = useChatBot();

    const { text, visible, shown, animKey } = useChatBotTooltip(isTyping, messages);

    useEffect(() => {
        const handler = () => { if (!isOpen) toggle(); };
        window.addEventListener('lyrium:open-chatbot', handler);
        return () => window.removeEventListener('lyrium:open-chatbot', handler);
    }, [isOpen, toggle]);

    const [savedPos, setSavedPos] = useState<{ x: number; y: number } | null>(loadPosition);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const didDrag = useRef(false);

    const currentPos = {
        x: (savedPos?.x ?? 0) + dragOffset.x,
        y: (savedPos?.y ?? 0) + dragOffset.y,
    };

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0) return;
        const el = e.currentTarget as HTMLElement;
        el.setPointerCapture(e.pointerId);
        dragStart.current = { x: e.clientX, y: e.clientY };
        didDrag.current = false;
        setDragOffset({ x: 0, y: 0 });
        setIsDragging(true);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        if (!didDrag.current && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
            didDrag.current = true;
        }
        if (didDrag.current) {
            setDragOffset({ x: dx, y: dy });
        }
    }, [isDragging]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        if (didDrag.current) {
            const newX = (savedPos?.x ?? 0) + (e.clientX - dragStart.current.x);
            const newY = (savedPos?.y ?? 0) + (e.clientY - dragStart.current.y);
            setSavedPos({ x: newX, y: newY });
            savePosition(newX, newY);
        }
        setDragOffset({ x: 0, y: 0 });
    }, [isDragging, savedPos]);

    const handleToggle = useCallback(() => {
        if (didDrag.current) return;
        if (isMinimized) restore();
        else toggle();
    }, [toggle, restore, isMinimized]);

    return (
        <>
            <ChatBotPanel
                isOpen={isOpen}
                isMinimized={isMinimized}
                messages={messages}
                isTyping={isTyping}
                onClose={close}
                onMinimize={minimize}
                onSend={sendMessage}
                onBotResponse={addBotResponse}
                onClear={clearHistory}
                onWhatsAppClick={handleWhatsAppClick}
                tooltipText={text}
                tooltipVisible={visible}
                tooltipShown={shown}
                tooltipAnimKey={animKey}
            />

            <div
                className={`fixed bottom-16 right-4 sm:bottom-20 sm:right-6 z-[100] ${
                    isOpen && !isMinimized ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
                }`}
                style={{
                    transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
                    transition: isDragging ? 'none' : 'opacity 300ms, transform 300ms',
                    touchAction: 'none',
                }}
            >
                {!isOpen && shown && (
                    <div
                        key={animKey}
                        className={`absolute bottom-full right-0 mb-3 pointer-events-none select-none
                            transition-opacity duration-200 lyrio-fadein lyrio-float
                            ${visible ? 'opacity-100' : 'opacity-0'}`}
                        style={{ minWidth: 'max-content' }}
                    >
                        <style>{`
                            @keyframes lyrio-float {
                                0%, 100% { transform: translateY(0px); }
                                50%       { transform: translateY(-6px); }
                            }
                            @keyframes lyrio-fadein {
                                from { opacity: 0; transform: translateY(5px) scale(0.96); }
                                to   { opacity: 1; transform: translateY(0) scale(1); }
                            }
                            .lyrio-float  { animation: lyrio-float 2.8s ease-in-out infinite; }
                            .lyrio-fadein { animation: lyrio-fadein 0.28s ease-out forwards; }
                        `}</style>

                        <div className="bg-white border border-emerald-200 rounded-2xl px-4 py-2.5 shadow-lg">
                            <p className="text-sm font-medium text-gray-700 whitespace-nowrap">{text}</p>
                        </div>

                        <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-emerald-200/60 lyrio-float"
                             style={{ animationDelay: '0.3s', animationDuration: '2.8s' }} />
                        <div className="absolute -left-12 top-3 w-1.5 h-1.5 rounded-full bg-emerald-300/40 lyrio-float"
                             style={{ animationDelay: '0.9s', animationDuration: '3.2s' }} />
                        <div className="absolute -left-6 top-6 w-2 h-2 rounded-full bg-emerald-200/50 lyrio-float"
                             style={{ animationDelay: '1.5s', animationDuration: '2.5s' }} />
                        <div className="absolute -left-9 top-9 w-1 h-1 rounded-full bg-emerald-300/30 lyrio-float"
                             style={{ animationDelay: '2.1s', animationDuration: '3.5s' }} />

                        <div className="absolute bottom-0 right-[22px] translate-y-full"
                             style={{ width:0, height:0,
                                 borderLeft:'9px solid transparent', borderRight:'9px solid transparent',
                                 borderTop:'9px solid #a7f3d0' }} />
                        <div className="absolute bottom-0 right-[23px] translate-y-[7px]"
                             style={{ width:0, height:0,
                                 borderLeft:'8px solid transparent', borderRight:'8px solid transparent',
                                 borderTop:'8px solid white' }} />
                    </div>
                )}

                <button
                    onClick={handleToggle}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="shadow-lg hover:scale-110 active:scale-95 transition-transform duration-300 cursor-grab active:cursor-grabbing select-none"
                    aria-label="Abrir chat"
                >
                    <div className="bg-gradient-to-br from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] dark:hover:from-emerald-600 dark:hover:to-teal-500 text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300">
                        <LogoLyrium size="sm" showText={false} frontImg="/img/iconologo.png" circleSize={54} />
                    </div>
                </button>
            </div>
        </>
    );
}
