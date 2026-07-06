'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatBotMessage } from '../types';

const TEXT = {
    initial: '¡Hola! Soy Lyrio 👋',
    typing:  'Estoy pensando... 🤔',
    replied: '¿En qué más puedo ayudarte? 🌿',
    idle:    '¿Sigues por ahí? Te escucho 😊',
};

const VISIBLE_DURATION = 5_000;

export function useChatBotTooltip(isTyping: boolean, messages: ChatBotMessage[]) {
    const [text, setText]       = useState(TEXT.initial);
    const [visible, setVisible] = useState(true);
    const [shown, setShown]     = useState(true);
    const [animKey, setAnimKey] = useState(0);

    const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function clearTimers() {
        if (hideRef.current) clearTimeout(hideRef.current);
        if (idleRef.current) clearTimeout(idleRef.current);
    }

    function show(next: string) {
        clearTimers();
        if (!shown) {
            setText(next);
            setAnimKey((k) => k + 1);
            setShown(true);
            setVisible(true);
        } else {
            setVisible(false);
            setTimeout(() => {
                setText(next);
                setAnimKey((k) => k + 1);
                setVisible(true);
            }, 180);
        }
        if (next !== TEXT.typing) {
            hideRef.current = setTimeout(() => {
                setVisible(false);
                setTimeout(() => setShown(false), 280);
            }, VISIBLE_DURATION);
        }
    }

    useEffect(() => {
        clearTimers();
        if (isTyping) { show(TEXT.typing); return; }

        const userCount = messages.filter((m) => m.role === 'user').length;
        if (userCount > 0) {
            show(TEXT.replied);
            idleRef.current = setTimeout(() => show(TEXT.idle), 12_000);
        } else {
            show(TEXT.initial);
        }
        return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTyping, messages]);

    return { text, visible, shown, animKey };
}
