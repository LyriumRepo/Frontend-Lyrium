'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    MessageSquare, 
    Send, 
    Search, 
    Plus, 
    Store, 
    Users, 
    Sparkles, 
    Paperclip, 
    Smile, 
    MoreVertical,
    MessageCircle,
    UserCheck
} from 'lucide-react';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import ConversationList from '@/components/shared/chat/ConversationList';

interface Message {
    id: number;
    sender: 'admin' | 'seller' | 'client';
    name: string;
    role: string;
    text: string;
    time: string;
    reactions?: string[];
}

interface Conversation {
    id: number;
    avatar: string;
    name: string;
    contact: string;
    tag: string;
    date: string;
    messages: Message[];
}

export interface HelpDeskModuleProps {
    data?: any;
    loading?: boolean;
    currentTab?: "todos" | "asignados" | "faq" | "auditoria";
    setCurrentTab?: (tab: "todos" | "asignados" | "faq" | "auditoria") => void;
    selectedTicket?: any;
    tickets?: any[];
    filteredAudit?: any[];
    filters?: any;
    setFilters?: (filters: any) => void;
    actions?: any;
    onEscalate?: () => void;
    onCloseTicket?: () => void;
    onFAQCreate?: () => void;
    onFAQDetail?: (id: number) => void;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    hasMoreMessages?: boolean;
    setTotalConsultas?: (count: number) => void;
}

export const HelpDeskModule: React.FC<HelpDeskModuleProps> = ({
    data,
    loading,
    currentTab = 'todos',
    setCurrentTab,
    selectedTicket,
    tickets,
    filteredAudit,
    filters,
    setFilters,
    actions,
    onEscalate,
    onCloseTicket,
    onFAQCreate,
    onFAQDetail,
    onLoadMore,
    isLoadingMore,
    hasMoreMessages,
    setTotalConsultas
}) => {
    // --- Mock State fallback for Chat Tab (fully interactive) ---
    const [vendedorConversations, setVendedorConversations] = useState<Conversation[]>([
        {
            id: 1,
            avatar: 'J',
            name: 'Tienda Ecológica Cusco',
            contact: 'juan.perez@cuscoeco.com',
            tag: 'Logística',
            date: '11 mar.',
            messages: [
                {
                    id: 1,
                    sender: 'admin',
                    name: 'TÚ',
                    role: 'Administrador',
                    text: 'Hola Juan, queremos verificar si el último lote de fertilizantes orgánicos ya cuenta con la certificación SENASA para su publicación.',
                    time: '10:00 a. m.',
                    reactions: ['👍']
                },
                {
                    id: 2,
                    sender: 'seller',
                    name: 'JUAN PÉREZ',
                    role: 'Vendedor',
                    text: '¡Hola! Sí, estimado. La guía de remisión y el certificado orgánico de Cusco ya fueron cargados en la sección de documentos de la tienda.',
                    time: '10:15 a. m.',
                    reactions: ['❤️']
                }
            ]
        },
        {
            id: 2,
            avatar: 'M',
            name: 'Moda Orgánica & Co.',
            contact: 'maria.silva@modaco.pe',
            tag: 'Catálogo',
            date: '10 mar.',
            messages: [
                {
                    id: 1,
                    sender: 'admin',
                    name: 'TÚ',
                    role: 'Administrador',
                    text: 'Hola María, el área de control de calidad aprobó tus aceites esenciales de lavanda y chía. Ya puedes activar el stock.',
                    time: '09:00 a. m.',
                    reactions: ['👍']
                },
                {
                    id: 2,
                    sender: 'seller',
                    name: 'MARÍA SILVA',
                    role: 'Vendedor',
                    text: '¡Excelente noticia! Muchas gracias por el soporte rápido. Acabo de subir 50 unidades en el almacén digital.',
                    time: '09:05 a. m.',
                    reactions: ['🎉']
                }
            ]
        },
        {
            id: 3,
            avatar: 'A',
            name: 'Apicultura Sierra Verde',
            contact: 'alberto.rios@sierraverde.com',
            tag: 'Finanzas',
            date: '08 mar.',
            messages: [
                {
                    id: 1,
                    sender: 'seller',
                    name: 'ALBERTO RÍOS',
                    role: 'Vendedor',
                    text: 'Buenas tardes. ¿La comisión del plan Especial (15%) aplica también a los productos en oferta?',
                    time: '02:30 p. m.'
                },
                {
                    id: 2,
                    sender: 'admin',
                    name: 'TÚ',
                    role: 'Administrador',
                    text: 'Hola Alberto, sí. La tasa de comisión se calcula sobre el precio de venta final facturado al cliente en checkout.',
                    time: '02:45 p. m.',
                    reactions: ['👍']
                }
            ]
        }
    ]);

    const [clienteConversations, setClienteConversations] = useState<Conversation[]>([
        {
            id: 101,
            avatar: 'L',
            name: 'Luis Medina',
            contact: 'luis.medina@email.com',
            tag: 'Reembolso',
            date: '11 mar.',
            messages: [
                {
                    id: 1,
                    sender: 'client',
                    name: 'LUIS MEDINA',
                    role: 'Cliente',
                    text: 'Hola, mi pedido de miel orgánica y propóleo llegó con el frasco roto. El transportista dijo que lo reportaría.',
                    time: '11:00 a. m.'
                },
                {
                    id: 2,
                    sender: 'admin',
                    name: 'TÚ',
                    role: 'Administrador',
                    text: 'Lamentamos mucho el inconveniente, Luis. Ya verifiqué el reporte y hemos procedido con la devolución total de los puntos a tu cuenta de fidelidad y abono bancario.',
                    time: '11:20 a. m.',
                    reactions: ['❤️']
                }
            ]
        },
        {
            id: 102,
            avatar: 'S',
            name: 'Sofía Valdivia',
            contact: 'sofia.val@email.com',
            tag: 'Puntos',
            date: '09 mar.',
            messages: [
                {
                    id: 1,
                    sender: 'client',
                    name: 'SOFÍA VALDIVIA',
                    role: 'Cliente',
                    text: 'Hola. ¿Cómo puedo canjear mis puntos acumulados por el cupón de descuento en envíos?',
                    time: '04:00 p. m.'
                },
                {
                    id: 2,
                    sender: 'admin',
                    name: 'TÚ',
                    role: 'Administrador',
                    text: '¡Hola Sofía! Ingresa a tu panel "Mis Puntos" > "Canjear Recompensas", selecciona el cupón de envío y el sistema te generará un código promocional listo para usar en tu carrito.',
                    time: '04:12 p. m.',
                    reactions: ['👍']
                }
            ]
        }
    ]);

    const [activeMode, setActiveMode] = useState<'vendedores' | 'clientes'>('vendedores');
    const [activeChatId, setActiveChatId] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const currentConversations = activeMode === 'vendedores' ? vendedorConversations : clienteConversations;
    const activeChat = currentConversations.find(c => c.id === activeChatId) || currentConversations[0] || null;
    
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 50);
        return () => clearTimeout(timer);
    }, [activeChatId, activeChat?.messages, activeMode]);

    useEffect(() => {
        if (setTotalConsultas) {
            const currentCount = activeMode === 'vendedores' 
                ? vendedorConversations.length 
                : clienteConversations.length;
            setTotalConsultas(currentCount);
        }
    }, [vendedorConversations.length, clienteConversations.length, activeMode, setTotalConsultas]);

    const handleModeChange = (mode: 'vendedores' | 'clientes') => {
        setActiveMode(mode);
        setSearchTerm('');
        if (mode === 'vendedores') {
            setActiveChatId(1);
        } else {
            setActiveChatId(101);
        }
    };

    const getMockIsoTimestamp = (timeStr: string) => {
        const now = new Date();
        try {
            const match = timeStr.match(/(\d+):(\d+)\s*(a\.\s*m\.|p\.\s*m\.|AM|PM)/i);
            if (match) {
                let hour = parseInt(match[1]);
                const minute = parseInt(match[2]);
                const isPm = match[3].toLowerCase().includes('p');
                if (isPm && hour < 12) hour += 12;
                if (!isPm && hour === 12) hour = 0;
                now.setHours(hour, minute, 0, 0);
            }
        } catch {}
        return now.toISOString();
    };

    const filteredConversations = currentConversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const mappedConversations = filteredConversations.map(conv => {
        const lastMsg = conv.messages[conv.messages.length - 1];
        return {
            id: String(conv.id),
            name: conv.name,
            lastMessage: lastMsg ? lastMsg.text : 'No hay mensajes',
            lastMessageTime: lastMsg ? lastMsg.time : '',
            unreadCount: 0,
            category: conv.tag,
            isActive: activeChatId === conv.id
        };
    });

    const mappedMessages = activeChat ? activeChat.messages.map((msg, idx) => ({
        id: String(msg.id ?? idx),
        sender: msg.sender === 'admin' ? 'admin' : 'other',
        content: msg.text,
        timestamp: getMockIsoTimestamp(msg.time),
        read_at: new Date().toISOString()
    })) : [];

    const listContent = (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[var(--border-subtle)] shrink-0 space-y-4">
                <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[1.8rem] border border-[var(--border-subtle)] shadow-inner">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleModeChange('vendedores');
                        }}
                        className={`flex-1 py-3 rounded-[1.4rem] text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                            activeMode === 'vendedores'
                                ? 'bg-[var(--bg-card)] text-[var(--turquesa-500)] shadow-md border border-[var(--border-subtle)]/30'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                        }`}
                    >
                        <Store className="w-3.5 h-3.5" /> Vendedores
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all border ${
                            activeMode === 'vendedores'
                                ? 'bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)] border-[var(--turquesa-500)]/20 shadow-sm'
                                : 'bg-zinc-500/10 dark:bg-zinc-800/40 text-[var(--text-muted)] border-transparent'
                        }`}>
                            {vendedorConversations.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleModeChange('clientes');
                        }}
                        className={`flex-1 py-3 rounded-[1.4rem] text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                            activeMode === 'clientes'
                                ? 'bg-[var(--bg-card)] text-[var(--turquesa-500)] shadow-md border border-[var(--border-subtle)]/30'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" /> Clientes
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all border ${
                            activeMode === 'clientes'
                                ? 'bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)] border-[var(--turquesa-500)]/20 shadow-sm'
                                : 'bg-zinc-500/10 dark:bg-zinc-800/40 text-[var(--text-muted)] border-transparent'
                        }`}>
                            {clienteConversations.length}
                        </span>
                    </button>
                </div>

                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    <input
                        type="text"
                        placeholder={activeMode === 'vendedores' ? "Buscar vendedor..." : "Buscar cliente..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 outline-none font-bold placeholder:text-[var(--text-muted)]"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ConversationList
                    conversations={mappedConversations}
                    activeId={String(activeChatId)}
                    onSelect={(id) => setActiveChatId(Number(id))}
                    accentColor="turquesa"
                />
            </div>
        </div>
    );

    const headerColors = [
        'bg-[var(--verde-500)]',
        'bg-[var(--turquesa-500)]',
        'bg-[var(--celeste-500)]',
    ];
    const headerColorIdx = activeChat ? String(activeChat.id).charCodeAt(0) % headerColors.length : 0;
    const headerAvatarBg = headerColors[headerColorIdx];

    const chatContent = activeChat ? (
        <div className="flex flex-col h-full">
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 shrink-0 rounded-full ${headerAvatarBg} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
                            {activeChat.avatar}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] truncate">
                                {activeChat.name}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{activeChat.contact}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)] border border-[var(--turquesa-500)]/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--turquesa-500)] animate-ping" /> Activo
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[var(--bg-card)]/50 custom-scrollbar">
                <MessageBubble
                    messages={mappedMessages}
                    isSentOverride={(msg) => {
                        const original = activeChat.messages.find((m, idx) => String(m.id ?? idx) === msg.id);
                        return original?.sender === 'admin';
                    }}
                    meta={{
                        currentUserName: 'Tú',
                        currentUserRole: 'Administrador',
                        otherName: activeChat.name,
                        otherRole: activeMode === 'vendedores' ? 'Vendedor' : 'Cliente',
                        showAvatar: true,
                    }}
                    sentClassName="bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-[1.75rem] rounded-br-md shadow-md shadow-[var(--turquesa-500)]/10"
                    receivedClassName="bg-white/80 dark:bg-[var(--bg-secondary)] backdrop-blur-md border border-white/20 dark:border-[var(--border-subtle)] text-[var(--text-primary)] rounded-[1.75rem] rounded-bl-md shadow-sm"
                    sentAvatarClassName="bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white"
                    receivedAvatarClassName={`${headerAvatarBg} text-white`}
                />
                <div ref={chatContainerRef} />
            </div>

            <MessageInput
                onSend={(text) => {
                    const now = new Date();
                    const formattedTime = now.toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });

                    const newMessage: Message = {
                        id: Date.now(),
                        sender: 'admin',
                        name: 'TÚ',
                        role: 'Administrador',
                        text: text.trim(),
                        time: formattedTime,
                        reactions: []
                    };

                    if (activeMode === 'vendedores') {
                        setVendedorConversations(prev =>
                            prev.map(c => (c.id === activeChatId ? { ...c, messages: [...c.messages, newMessage] } : c))
                        );
                    } else {
                        setClienteConversations(prev =>
                            prev.map(c => (c.id === activeChatId ? { ...c, messages: [...c.messages, newMessage] } : c))
                        );
                    }
                }}
                placeholder="Escribe un mensaje en el canal de soporte..."
            />
        </div>
    ) : (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--turquesa-500)]/10 to-[var(--verde-500)]/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[var(--turquesa-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">Selecciona una conversación</p>
                <p className="text-xs text-[var(--text-secondary)]">Elige un chat de la lista para comenzar</p>
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col gap-6 font-industrial animate-fadeIn pb-12 text-[var(--text-primary)]">
            <ChatLayout
                list={listContent}
                detail={chatContent}
                style={{ background: 'var(--bg-card)' }}
                listHeaderLineClassName="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)]"
                detailHeaderLineClassName="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)]"
            />
        </div>
    );
};

export default HelpDeskModule;