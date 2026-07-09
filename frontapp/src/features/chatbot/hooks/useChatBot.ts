'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatBotMessage } from '../types';
import { LARAVEL_API_URL, WHATSAPP_SUPPORT_NUMBER } from '@/shared/lib/config/flags';

const STORAGE_KEY = 'lyrium_chatbot_session';
const SESSION_ID_KEY = 'lyrium_chatbot_session_id';

const MAX_MESSAGE_LENGTH = 2000;

const WELCOME_MESSAGE: ChatBotMessage = {
    id: 'welcome',
    role: 'assistant',
    content: 'Hola, soy Lyrio, tu asistente virtual. ¿En qué puedo ayudarte?',
    timestamp: new Date().toISOString(),
};

function generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
        localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
}

function loadMessages(): ChatBotMessage[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as ChatBotMessage[];
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {}
    return [WELCOME_MESSAGE];
}

function saveMessages(messages: ChatBotMessage[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
}

// Mensajes cortos de navegación que no aportan contexto real al operador
const NAV_MESSAGES = new Set(['a','b','c','d','e','f','1','2','3','4','5','6','7','8','9','vender','comprar','hola','buenas','inicio','menu','menú','atras','atrás','holis']);

function buildWhatsAppUrl(baseUrl: string, history: ChatBotMessage[]): string {
    // Tomar los últimos 5 mensajes del usuario, descartar navegación pura
    const userMessages = history
        .filter((m) => m.role === 'user')
        .filter((m) => !NAV_MESSAGES.has(m.content.trim().toLowerCase()) && m.content.trim().length > 3)
        .slice(-5);

    let text: string;

    if (userMessages.length === 0) {
        text = 'Hola 👋 Vengo del chatbot de Lyrium y necesito ayuda con una consulta.';
    } else if (userMessages.length === 1) {
        const consulta = userMessages[0].content.slice(0, 200);
        text = `Hola 👋 Vengo del chatbot de Lyrium.\nConsulta: "${consulta}"`;
    } else {
        // Múltiples mensajes: armar un resumen cronológico
        const resumen = userMessages
            .map((m) => `• ${m.content.slice(0, 120)}`)
            .join('\n');
        text = `Hola 👋 Vengo del chatbot de Lyrium.\nResumen de mi consulta:\n${resumen}`;
    }

    // Garantizar que la URL no supere límites prácticos de WhatsApp (~2000 chars total)
    const encoded = encodeURIComponent(text);
    if (encoded.length > 1800) {
        const corto = userMessages.at(-1)?.content.slice(0, 200) ?? '';
        return `${baseUrl}?text=${encodeURIComponent(`Hola 👋 Vengo del chatbot de Lyrium.\nConsulta: "${corto}"`)}`;
    }

    return `${baseUrl}?text=${encoded}`;
}

export function useChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatBotMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sessionIdRef = useRef<string>('');
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        sessionIdRef.current = getSessionId();
        setMessages(loadMessages());
    }, []);

    useEffect(() => {
        if (initializedRef.current) {
            saveMessages(messages);
        }
    }, [messages]);

    const toggle = useCallback(() => {
        setIsOpen((prev) => {
            if (!prev) {
                setIsMinimized(false);
            }
            return !prev;
        });
        setError(null);
    }, []);

    const minimize = useCallback(() => {
        setIsMinimized(true);
    }, []);

    const restore = useCallback(() => {
        setIsMinimized(false);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setIsMinimized(false);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
            setError(`El mensaje no puede exceder los ${MAX_MESSAGE_LENGTH} caracteres.`);
            return;
        }

        setError(null);

        const userMessage: ChatBotMessage = {
            id: generateId(),
            role: 'user',
            content: trimmedContent,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const history = messages
                .filter((m) => m.role !== 'system')
                .slice(-10)
                .map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

            const token = typeof window !== 'undefined' ? localStorage.getItem('laravel_token') : null;

            const response = await fetch(`${LARAVEL_API_URL}/chatbot/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Session-Id': sessionIdRef.current,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: trimmedContent,
                    history,
                }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error?.message || body.error || `Error ${response.status}`);
            }

            const data = await response.json();

            const source: string = data.data?.source ?? '';
            const isHandoff = source === 'handoff' || source === 'fallback';
            const whatsappBase: string = data.data?.whatsapp_url ?? `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`;

            // Incluir el mensaje actual del usuario en el historial para el contexto
            const fullHistory: ChatBotMessage[] = [
                ...messages,
                { id: 'current', role: 'user', content: trimmedContent, timestamp: new Date().toISOString() },
            ];

            const botMessage: ChatBotMessage = {
                id: generateId(),
                role: 'assistant',
                content: data.data?.reply || 'Lo siento, no pude procesar tu consulta.',
                timestamp: new Date().toISOString(),
                ...(isHandoff && {
                    whatsappAction: {
                        url: buildWhatsAppUrl(whatsappBase, fullHistory),
                        label: 'Continuar por WhatsApp',
                    },
                }),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
            setError(errorMessage);

            const errorBotMessage: ChatBotMessage = {
                id: generateId(),
                role: 'assistant',
                content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo más tarde.',
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorBotMessage]);
        } finally {
            setIsTyping(false);
        }
    }, [messages]);

    const addBotResponse = useCallback((content: string) => {
        const botMessage: ChatBotMessage = {
            id: generateId(),
            role: 'assistant',
            content,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
    }, []);

    const clearHistory = useCallback(() => {
        setMessages([WELCOME_MESSAGE]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const handleWhatsAppClick = useCallback(() => {
        addBotResponse(
            '¡Listo! 🌿 Te estamos conectando con uno de nuestros asesores. Ellos ya tienen el contexto de tu consulta. ¡Que tengas un buen día!'
        );
    }, [addBotResponse]);

    return {
        isOpen,
        isMinimized,
        messages,
        isTyping,
        error,
        toggle,
        minimize,
        restore,
        close,
        sendMessage,
        addBotResponse,
        clearHistory,
        handleWhatsAppClick,
    };
}
