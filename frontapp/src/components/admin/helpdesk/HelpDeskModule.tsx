'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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

interface Message {
    id: number | string;
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

interface RenderConvItem {
    id: string | number;
    avatar: string;
    name: string;
    lastMsgText: string;
    date: string;
    unreadCount: number;
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

const getCategoryLabel = (cat?: string): string => {
    const map: Record<string, string> = {
        tech: 'Técnico', admin: 'Admin', info: 'Info',
        comment: 'Elogio', followup: 'Seguimiento',
        payments: 'Pagos', documentation: 'Trámites',
    };
    return cat ? (map[cat] || cat) : 'Soporte';
};

const getCategoryBadgeClass = (tag: string): string => {
    switch (tag.toLowerCase()) {
        case 'logística': case 'logistica': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20';
        case 'catálogo': case 'catalogo': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20';
        case 'finanzas': return 'bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20';
        case 'reembolso': return 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20';
        case 'consulta puntos': case 'puntos': return 'bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20';
        case 'técnico': case 'tecnico': return 'bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20';
        case 'admin': return 'bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]';
        case 'info': return 'bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20';
        case 'pagos': return 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20';
        case 'trámites': case 'tramites': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20';
        case 'seguimiento': return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20';
        case 'elogio': return 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20';
        default: return 'bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]';
    }
};

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
    // Clientes: mock state (no admin API endpoint for customer support tickets)
    const [clienteConversations, setClienteConversations] = useState<Conversation[]>([
        {
            id: 101,
            avatar: 'L',
            name: 'Luis Medina',
            contact: 'luis.medina@email.com',
            tag: 'Reembolso',
            date: '11 mar.',
            messages: [
                { id: 1, sender: 'client', name: 'LUIS MEDINA', role: 'Cliente', text: 'Hola, mi pedido de miel orgánica y propóleo llegó con el frasco roto. El transportista dijo que lo reportaría.', time: '11:00 a. m.' },
                { id: 2, sender: 'admin', name: 'TÚ', role: 'Administrador', text: 'Lamentamos mucho el inconveniente, Luis. Ya verifiqué el reporte y hemos procedido con la devolución total de los puntos a tu cuenta de fidelidad y abono bancario.', time: '11:20 a. m.', reactions: ['❤️'] }
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
                { id: 1, sender: 'client', name: 'SOFÍA VALDIVIA', role: 'Cliente', text: 'Hola. ¿Cómo puedo canjear mis puntos acumulados por el cupón de descuento en envíos?', time: '04:00 p. m.' },
                { id: 2, sender: 'admin', name: 'TÚ', role: 'Administrador', text: '¡Hola Sofía! Ingresa a tu panel "Mis Puntos" > "Canjear Recompensas", selecciona el cupón de envío y el sistema te generará un código promocional listo para usar en tu carrito.', time: '04:12 p. m.', reactions: ['👍'] }
            ]
        }
    ]);

    const [activeMode, setActiveMode] = useState<'vendedores' | 'clientes'>('vendedores');
    const [activeChatId, setActiveChatId] = useState<string | number>('');
    const [typedMessage, setTypedMessage] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    // Local reactions for real API messages (reactions are UI-only, no backend endpoint)
    const [localReactions, setLocalReactions] = useState<Record<string | number, string[]>>({});

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // Build vendedor conversation list from real API tickets
    const vendedorConvItems = useMemo<RenderConvItem[]>(() => {
        return (tickets ?? []).map((t: any) => ({
            id: String(t.id),
            avatar: (t.requester?.name?.[0] || 'V').toUpperCase(),
            name: t.requester?.name || 'Vendedor',
            lastMsgText: t.description || `Ticket #${t.displayId}`,
            date: t.updatedAt || 'Ahora',
            unreadCount: t.unreadCount ?? 0,
        }));
    }, [tickets]);

    // Auto-select first ticket when tickets load
    useEffect(() => {
        if (activeMode === 'vendedores' && vendedorConvItems.length > 0 && !activeChatId) {
            const first = vendedorConvItems[0];
            setActiveChatId(first.id);
            if (actions?.selectTicket) actions.selectTicket(Number(first.id));
        }
    }, [vendedorConvItems]); // eslint-disable-line react-hooks/exhaustive-deps

    // Map real ticket messages from selectedTicket prop
    const realVendedorMessages = useMemo<Message[]>(() => {
        if (!selectedTicket || String(selectedTicket.id) !== String(activeChatId)) return [];
        const msgs: any[] = selectedTicket.mensajes ?? [];
        return msgs.map((msg: any) => ({
            id: msg.id,
            sender: msg.isUser ? 'seller' as const : 'admin' as const,
            name: (msg.user || msg.usuario || (msg.isUser ? 'Vendedor' : 'Tú')).toUpperCase(),
            role: msg.role || (msg.isUser ? 'Vendedor' : 'Administrador'),
            text: msg.texto || msg.contenido || '',
            time: msg.hora || (msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
                : '--:--'),
            reactions: localReactions[msg.id] ?? [],
        }));
    }, [selectedTicket, activeChatId, localReactions]);

    // Active conversation info for header
    const activeVendedorConv = vendedorConvItems.find(c => String(c.id) === String(activeChatId)) ?? null;
    const activeClienteChat = clienteConversations.find(c => String(c.id) === String(activeChatId)) ?? null;

    const hasActiveChat = activeMode === 'vendedores' ? !!activeVendedorConv : !!activeClienteChat;
    const activeChatName = activeMode === 'vendedores' ? (activeVendedorConv?.name ?? '') : (activeClienteChat?.name ?? '');
    const activeChatContact = activeMode === 'vendedores' ? (activeVendedorConv?.lastMsgText ?? '') : (activeClienteChat?.contact ?? '');
    const activeChatAvatar = activeMode === 'vendedores' ? (activeVendedorConv?.avatar ?? 'V') : (activeClienteChat?.avatar ?? 'C');
    const activeMessages: Message[] = activeMode === 'vendedores' ? realVendedorMessages : (activeClienteChat?.messages ?? []);

    useEffect(() => {
        const timer = setTimeout(() => scrollToBottom(), 50);
        return () => clearTimeout(timer);
    }, [activeChatId, realVendedorMessages.length, activeClienteChat?.messages?.length, activeMode]);

    useEffect(() => {
        if (setTotalConsultas) {
            const count = activeMode === 'vendedores' ? vendedorConvItems.length : clienteConversations.length;
            setTotalConsultas(count);
        }
    }, [vendedorConvItems.length, clienteConversations.length, activeMode, setTotalConsultas]);

    const handleModeChange = (mode: 'vendedores' | 'clientes') => {
        setActiveMode(mode);
        setSearchTerm('');
        if (mode === 'vendedores') {
            const first = vendedorConvItems[0];
            if (first) {
                setActiveChatId(first.id);
                if (actions?.selectTicket) actions.selectTicket(Number(first.id));
            } else {
                setActiveChatId('');
            }
        } else {
            setActiveChatId(clienteConversations[0]?.id ?? 101);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!typedMessage.trim()) return;

        if (activeMode === 'vendedores' && activeChatId) {
            if (actions?.sendReply) actions.sendReply(typedMessage.trim());
            setTypedMessage('');
        } else if (activeMode === 'clientes') {
            const now = new Date();
            const formattedTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
            const newMsg: Message = { id: Date.now(), sender: 'admin', name: 'TÚ', role: 'Administrador', text: typedMessage.trim(), time: formattedTime, reactions: [] };
            setClienteConversations(prev =>
                prev.map(c => String(c.id) === String(activeChatId) ? { ...c, messages: [...c.messages, newMsg] } : c)
            );
            setTypedMessage('');
        }
    };

    const handleAddReaction = (messageId: number | string, reaction: string) => {
        if (activeMode === 'vendedores') {
            setLocalReactions(prev => {
                const current = prev[messageId] ?? [];
                const has = current.includes(reaction);
                return { ...prev, [messageId]: has ? current.filter(r => r !== reaction) : [...current, reaction] };
            });
        } else {
            const updateMsgs = (msgs: Message[]) => msgs.map(m => {
                if (String(m.id) === String(messageId)) {
                    const current = m.reactions || [];
                    const has = current.includes(reaction);
                    return { ...m, reactions: has ? current.filter(r => r !== reaction) : [...current, reaction] };
                }
                return m;
            });
            setClienteConversations(prev =>
                prev.map(c => String(c.id) === String(activeChatId) ? { ...c, messages: updateMsgs(c.messages) } : c)
            );
        }
    };

    const filteredConversations = useMemo<RenderConvItem[]>(() => {
        const term = searchTerm.toLowerCase();
        if (activeMode === 'vendedores') {
            return vendedorConvItems.filter(c =>
                c.name.toLowerCase().includes(term) || c.lastMsgText.toLowerCase().includes(term)
            );
        }
        return clienteConversations
            .filter(c => c.name.toLowerCase().includes(term) || c.contact.toLowerCase().includes(term))
            .map(c => {
                const lastMsg = c.messages[c.messages.length - 1];
                return { id: c.id, avatar: c.avatar, name: c.name, lastMsgText: lastMsg?.text ?? 'No hay mensajes', date: c.date, unreadCount: 0 };
            });
    }, [activeMode, vendedorConvItems, clienteConversations, searchTerm]);

    return (
        <div className="w-full flex flex-col gap-6 font-industrial animate-fadeIn pb-12 text-[var(--text-primary)]">

            {/* ── CHAT SECTION ── */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[580px] animate-fadeIn">

                {/* Left: conversation list */}
                <div className="w-full lg:w-96 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] p-6 flex flex-col shadow-sm gap-4">

                    {/* Mode toggle */}
                    <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[1.8rem] border border-[var(--border-subtle)] shadow-inner">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleModeChange('vendedores'); }}
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
                                {vendedorConvItems.length}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleModeChange('clientes'); }}
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

                    {/* Search */}
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                        <input
                            type="text"
                            placeholder={activeMode === 'vendedores' ? 'Buscar vendedor...' : 'Buscar cliente...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 outline-none font-bold placeholder:text-[var(--text-muted)]"
                        />
                    </div>

                    {/* Conversation list */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[420px] pr-1 custom-scrollbar">
                        {loading && activeMode === 'vendedores' && vendedorConvItems.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-muted)] font-bold italic text-xs">
                                Cargando tickets...
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-muted)] font-bold italic text-xs">
                                No se encontraron chats
                            </div>
                        ) : (
                            filteredConversations.map((chat) => {
                                const isActive = String(chat.id) === String(activeChatId);
                                return (
                                    <div
                                        key={String(chat.id)}
                                        onClick={() => {
                                            setActiveChatId(chat.id);
                                            if (activeMode === 'vendedores' && actions?.selectTicket) {
                                                actions.selectTicket(Number(chat.id));
                                            }
                                        }}
                                        className={`p-4 rounded-3xl flex gap-3.5 cursor-pointer transition-all border ${
                                            isActive
                                                ? 'bg-[var(--turquesa-500)]/10 border-[var(--turquesa-500)]/30 shadow-md shadow-[var(--turquesa-500)]/5'
                                                : 'hover:bg-[var(--bg-secondary)]/50 border-transparent'
                                        }`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--turquesa-500)]/10 to-[var(--verde-500)]/20 text-[var(--turquesa-500)] flex items-center justify-center font-black text-sm shrink-0 border border-[var(--turquesa-500)]/10">
                                                {chat.avatar}
                                            </div>
                                            {isActive && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--turquesa-500)] border-2 border-[var(--bg-card)] shadow-[0_0_8px_var(--turquesa-500)] animate-pulse" />
                                            )}
                                            {chat.unreadCount > 0 && !isActive && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-success)] text-white text-[8px] font-black flex items-center justify-center border border-[var(--bg-card)]">
                                                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-tight">{chat.name}</h3>
                                                <span className="text-[9px] text-[var(--text-muted)] font-bold shrink-0">{chat.date}</span>
                                            </div>
                                            <p className="text-[11px] text-[var(--text-secondary)] truncate mt-1 font-medium">
                                                {chat.lastMsgText}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: active chat */}
                <div className="flex-1 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] flex flex-col overflow-hidden shadow-xl">

                    {hasActiveChat ? (
                        <>
                            {/* Chat header */}
                            <div className="p-5 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--turquesa-500)]/20 to-[var(--verde-500)]/10 text-[var(--turquesa-500)] flex items-center justify-center font-black text-sm border border-[var(--turquesa-500)]/20 shadow-md">
                                        {activeChatAvatar}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-[var(--text-primary)] leading-none uppercase tracking-tight">{activeChatName}</h3>
                                        <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1.5 tracking-wide">{activeChatContact}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)] border border-[var(--turquesa-500)]/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--turquesa-500)] animate-ping" /> Activo
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => alert('Opciones avanzadas del canal')}
                                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={chatContainerRef} className="p-6 flex-1 overflow-y-auto space-y-6 max-h-[380px] min-h-[350px] bg-[var(--bg-card)]/50 custom-scrollbar">
                                {activeMessages.length === 0 && activeMode === 'vendedores' ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-xs font-bold text-[var(--text-muted)]">
                                            {selectedTicket && String(selectedTicket.id) === String(activeChatId)
                                                ? 'No hay mensajes en este ticket aún.'
                                                : 'Cargando mensajes...'}
                                        </p>
                                    </div>
                                ) : (
                                    activeMessages.map((msg, idx) => {
                                        const isAdmin = msg.sender === 'admin';
                                        return (
                                            <div
                                                key={String(msg.id)}
                                                className={`flex ${isAdmin ? 'justify-end animate-bubble-in-right' : 'justify-start animate-bubble-in-left'} group/msg`}
                                                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                                            >
                                                <div className={`max-w-[70%] p-4 rounded-3xl relative flex flex-col gap-1.5 shadow-sm transition-all duration-300 hover:shadow-md ${
                                                    isAdmin
                                                        ? 'bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-tr-none shadow-md shadow-[var(--turquesa-500)]/5'
                                                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-subtle)]'
                                                }`}>
                                                    <div className={`text-[9px] font-black uppercase tracking-wider ${
                                                        isAdmin ? 'text-white/80' : 'text-[var(--icons-green)]'
                                                    }`}>
                                                        {msg.name} <span className="opacity-75 font-normal">({msg.role})</span>
                                                    </div>

                                                    <p className="text-xs font-semibold leading-relaxed break-words">{msg.text}</p>

                                                    <div className="flex items-center justify-between gap-4 mt-1.5">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {msg.reactions?.map((r, i) => (
                                                                <span
                                                                    key={i}
                                                                    onClick={() => handleAddReaction(msg.id, r)}
                                                                    className="text-[9px] bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded-md cursor-pointer hover:scale-110 transition-transform"
                                                                >
                                                                    {r}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className={`text-[8px] font-bold shrink-0 ${isAdmin ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                                                            {msg.time}
                                                        </span>
                                                    </div>

                                                    {/* Reaction hover menu */}
                                                    <div className="absolute -top-3.5 right-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full px-2 py-0.5 shadow-lg hidden group-hover/msg:flex gap-1.5 z-10">
                                                        <button type="button" onClick={() => handleAddReaction(msg.id, '👍')} className="text-[10px] hover:scale-125 transition-transform">👍</button>
                                                        <button type="button" onClick={() => handleAddReaction(msg.id, '❤️')} className="text-[10px] hover:scale-125 transition-transform">❤️</button>
                                                        <button type="button" onClick={() => handleAddReaction(msg.id, '🎉')} className="text-[10px] hover:scale-125 transition-transform">🎉</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)]">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-center relative">
                                    <div className="flex gap-1 text-[var(--text-muted)] pl-2">
                                        <button type="button" onClick={() => alert('Adjuntar archivo/imagen')}
                                            className="p-2 hover:bg-[var(--bg-card)] rounded-full hover:text-[var(--text-primary)] transition active:scale-90">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => alert('Insertar emojis')}
                                            className="p-2 hover:bg-[var(--bg-card)] rounded-full hover:text-[var(--text-primary)] transition active:scale-90">
                                            <Smile className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje en el canal de soporte..."
                                        value={typedMessage}
                                        onChange={(e) => setTypedMessage(e.target.value)}
                                        className="flex-1 pl-4 pr-14 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[var(--turquesa-500)]/20 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2.5 w-11 h-11 rounded-xl bg-[var(--brand-green)] hover:bg-[var(--brand-green-hover)] text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-[var(--brand-green)]/30 border border-[var(--brand-green)]/20"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <MessageSquare className="w-14 h-14 text-[var(--text-muted)] mb-4" />
                            <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Soporte Lyrium</h4>
                            <p className="text-[11px] text-[var(--text-muted)] font-bold mt-1 max-w-xs">
                                {activeMode === 'vendedores' && loading
                                    ? 'Cargando tickets de soporte...'
                                    : 'Selecciona un chat activo del listado lateral para ver e iniciar la conversación.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpDeskModule;
