'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatBotMessage } from '../types';

const TEXT = {
    initial: '¡Hola! Soy Lyrio 👋',
    typing:  'Estoy pensando... 🤔',
    replied: '¿En qué más puedo ayudarte? 🌿',
    idle:    '¿Sigues por ahí? Te escucho 😊',
};

const PROACTIVE_MESSAGES = [
    '¡Hola! Soy Lyrio 👋',
    '¿Necesitas ayuda? 🌿',
    'Estoy aquí para ti 😊',
    '¿En qué puedo ayudarte?',
    '¿Sigues ahí? 🫶',
    'Puedo ayudarte con tus pedidos 📦',
    '¿Tienes alguna duda? 💚',
    'También puedo guiarte con compras 🛒',
    'Estoy disponible para lo que necesites ✨',
];

const VISIBLE_DURATION = 4_000;
// Tiempo entre un mensaje proactivo y el siguiente (de burbuja a burbuja).
const PROACTIVE_INTERVAL = 12_000;

export function useChatBotTooltip(isTyping: boolean, messages: ChatBotMessage[]) {
    const [text, setText]       = useState(TEXT.initial);
    const [visible, setVisible] = useState(true);
    const [shown, setShown]     = useState(true);
    const [animKey, setAnimKey] = useState(0);

    const hideRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
    const idleRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
    const proactiveRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const proactiveIdx  = useRef(0);
    const isActive      = useRef(true);

    function clearTimers() {
        if (hideRef.current) clearTimeout(hideRef.current);
        if (idleRef.current) clearTimeout(idleRef.current);
    }

    function clearProactive() {
        if (proactiveRef.current) clearTimeout(proactiveRef.current);
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

    function scheduleProactive(delay: number) {
        clearProactive();
        proactiveRef.current = setTimeout(() => {
            if (!isActive.current) return;
            const msg = PROACTIVE_MESSAGES[proactiveIdx.current % PROACTIVE_MESSAGES.length];
            proactiveIdx.current++;
            show(msg);
            if (isActive.current) {
                scheduleProactive(PROACTIVE_INTERVAL);
            }
        }, delay);
    }

    useEffect(() => {
        isActive.current = true;
        clearTimers();
        clearProactive();

        if (isTyping) { show(TEXT.typing); return; }

        const userCount = messages.filter((m) => m.role === 'user').length;
        if (userCount > 0) {
            show(TEXT.replied);
            idleRef.current = setTimeout(() => {
                show(TEXT.idle);
                scheduleProactive(PROACTIVE_INTERVAL);
            }, 12_000);
        } else {
            show(TEXT.initial);
            scheduleProactive(PROACTIVE_INTERVAL);
        }
        return () => {
            isActive.current = false;
            clearTimers();
            clearProactive();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTyping, messages]);

    return { text, visible, shown, animKey };
}
