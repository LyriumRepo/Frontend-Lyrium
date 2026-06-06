'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    const [typedMessage, setTypedMessage] = useState<string>('');
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

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!typedMessage.trim() || !activeChat) return;

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
            text: typedMessage.trim(),
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

        setTypedMessage('');
    };

    const handleAddReaction = (messageId: number, reaction: string) => {
        const updateMessages = (msgs: Message[]) => 
            msgs.map(m => {
                if (m.id === messageId) {
                    const currentReactions = m.reactions || [];
                    const hasReaction = currentReactions.includes(reaction);
                    return {
                        ...m,
                        reactions: hasReaction 
                            ? currentReactions.filter(r => r !== reaction)
                            : [...currentReactions, reaction]
                    };
                }
                return m;
            });

        if (activeMode === 'vendedores') {
            setVendedorConversations(prev => 
                prev.map(c => (c.id === activeChatId ? { ...c, messages: updateMessages(c.messages) } : c))
            );
        } else {
            setClienteConversations(prev => 
                prev.map(c => (c.id === activeChatId ? { ...c, messages: updateMessages(c.messages) } : c))
            );
        }
    };

    const filteredConversations = currentConversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Dynamic Tag pill styling ---
    const getCategoryBadgeClass = (tag: string) => {
        switch (tag.toLowerCase()) {
            case 'logística':
            case 'logistica':
                return 'bg-[var(--brand-teal)]/10 text-[var(--brand-teal)] border border-[var(--brand-teal)]/20 dark:bg-[var(--icons-green)]/10 dark:text-[var(--icons-green)] dark:border-[var(--icons-green)]/20';
            case 'catálogo':
            case 'catalogo':
                return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20';
            case 'finanzas':
                return 'bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20';
            case 'reembolso':
                return 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20';
            case 'consulta puntos':
            case 'puntos':
                return 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20';
            default:
                return 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--text-muted)]/20';
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 font-industrial animate-fadeIn pb-12 text-[var(--text-primary)]">
            
            {/* ── SECCIÓN PRINCIPAL: CHATS ── */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[580px] animate-fadeIn">
                
                {/* Columna Izquierda: Listado de Conversaciones */}
                <div className="w-full lg:w-96 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] p-6 flex flex-col shadow-sm gap-4">
                    
                    {/* Selector Interno Vendedores vs Clientes */}
                    <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[1.8rem] border border-[var(--border-subtle)] shadow-inner">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleModeChange('vendedores');
                            }}
                            className={`flex-1 py-3 rounded-[1.4rem] text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                                activeMode === 'vendedores'
                                    ? 'bg-[var(--bg-card)] text-emerald-400 shadow-md border border-[var(--border-subtle)]/30'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                            }`}
                        >
                            <Store className="w-3.5 h-3.5" /> Vendedores
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all border ${
                                activeMode === 'vendedores'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm'
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
                                    ? 'bg-[var(--bg-card)] text-emerald-400 shadow-md border border-[var(--border-subtle)]/30'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" /> Clientes
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all border ${
                                activeMode === 'clientes'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm'
                                    : 'bg-zinc-500/10 dark:bg-zinc-800/40 text-[var(--text-muted)] border-transparent'
                            }`}>
                                {clienteConversations.length}
                            </span>
                        </button>
                    </div>

                    {/* Buscador */}
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                        <input
                            type="text"
                            placeholder={activeMode === 'vendedores' ? "Buscar vendedor..." : "Buscar cliente..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold placeholder:text-[var(--text-muted)]"
                        />
                    </div>

                    {/* Lista Scrollable de Conversaciones */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[420px] pr-1 custom-scrollbar">
                        {filteredConversations.map((chat) => {
                            const isActive = chat.id === activeChatId;
                            const lastMsg = chat.messages[chat.messages.length - 1];
                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChatId(chat.id)}
                                    className={`p-4 rounded-3xl flex gap-3.5 cursor-pointer transition-all border ${
                                        isActive
                                            ? 'bg-emerald-500/5 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                                            : 'hover:bg-[var(--bg-secondary)]/50 border-transparent'
                                    }`}
                                >
                                    {/* Avatar con Indicador */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-500/10">
                                            {chat.avatar}
                                        </div>
                                        {isActive && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                        )}
                                    </div>
                                    
                                    {/* Textos */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-tight">{chat.name}</h3>
                                            <span className="text-[9px] text-[var(--text-muted)] font-bold shrink-0">{chat.date}</span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-secondary)] truncate mt-1 font-medium">
                                            {lastMsg ? lastMsg.text : 'No hay mensajes'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredConversations.length === 0 && (
                            <div className="text-center py-8 text-[var(--text-muted)] font-bold italic text-xs">
                                No se encontraron chats
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Vista del Chat Activo */}
                <div className="flex-1 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] flex flex-col overflow-hidden shadow-xl">
                    
                    {activeChat ? (
                        <>
                            {/* Cabecera del Chat */}
                            <div className="p-5 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/20 shadow-md">
                                        {activeChat.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-[var(--text-primary)] leading-none uppercase tracking-tight">{activeChat.name}</h3>
                                        <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1.5 tracking-wide">{activeChat.contact}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Activo
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

                            {/* Contenedor de Mensajes */}
                            <div ref={chatContainerRef} className="p-6 flex-1 overflow-y-auto space-y-6 max-h-[380px] min-h-[350px] bg-[var(--bg-card)]/50 custom-scrollbar">
                                {activeChat.messages.map((msg) => {
                                        const isAdmin = msg.sender === 'admin';
                                        return (
                                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group/msg`}>
                                                <div className={`max-w-[70%] p-4 rounded-3xl relative flex flex-col gap-1.5 shadow-sm transition-all ${
                                                    isAdmin
                                                        ? 'bg-brand-gradient text-white rounded-tr-none shadow-md shadow-[var(--brand-green)]/5'
                                                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-subtle)]'
                                                }`}>
                                                    
                                                    {/* Remitente */}
                                                    <div className={`text-[9px] font-black uppercase tracking-wider ${
                                                        isAdmin ? 'text-emerald-100' : 'text-emerald-500 dark:text-emerald-400'
                                                    }`}>
                                                        {msg.name} <span className="opacity-75 font-normal">({msg.role})</span>
                                                    </div>
                                                    
                                                    {/* Texto */}
                                                    <p className="text-xs font-semibold leading-relaxed break-words">{msg.text}</p>
                                                    
                                                    {/* Hora y Reacciones */}
                                                    <div className="flex items-center justify-between gap-4 mt-1.5">
                                                        {/* Reacciones */}
                                                        <div className="flex gap-1">
                                                            {msg.reactions?.map((r, i) => (
                                                                <span 
                                                                    key={i} 
                                                                    onClick={() => handleAddReaction(msg.id, r)}
                                                                    className="text-[9px] bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded-md cursor-pointer hover:scale-115 transition"
                                                                >
                                                                    {r}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className={`text-[8px] font-bold ${
                                                            isAdmin ? 'text-emerald-100/75' : 'text-[var(--text-muted)]'
                                                        }`}>
                                                            {msg.time}
                                                        </span>
                                                    </div>

                                                    {/* Micro Menú Flotante de Reacciones */}
                                                    <div className="absolute -top-3.5 right-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full px-2 py-0.5 shadow-lg hidden group-hover/msg:flex gap-1.5 transition-all">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleAddReaction(msg.id, '👍')}
                                                            className="text-[10px] hover:scale-120 transition"
                                                        >
                                                            👍
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleAddReaction(msg.id, '❤️')}
                                                            className="text-[10px] hover:scale-120 transition"
                                                        >
                                                            ❤️
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleAddReaction(msg.id, '🎉')}
                                                            className="text-[10px] hover:scale-120 transition"
                                                        >
                                                            🎉
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Footer e Input de Chat */}
                            <div className="p-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)]">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-center relative">
                                    <div className="flex gap-1 text-[var(--text-muted)] pl-2">
                                        <button 
                                            type="button" 
                                            onClick={() => alert('Adjuntar archivo/imagen')}
                                            className="p-2 hover:bg-[var(--bg-card)] rounded-full hover:text-[var(--text-primary)] transition active:scale-90"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => alert('Insertar emojis')}
                                            className="p-2 hover:bg-[var(--bg-card)] rounded-full hover:text-[var(--text-primary)] transition active:scale-90"
                                        >
                                            <Smile className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje en el canal de soporte..."
                                        value={typedMessage}
                                        onChange={(e) => setTypedMessage(e.target.value)}
                                        className="flex-1 pl-4 pr-14 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2.5 w-11 h-11 rounded-xl bg-brand-gradient hover:brightness-105 text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-[var(--brand-green)]/10 border border-[var(--border-subtle)]"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <MessageSquare className="w-14 h-14 text-[var(--text-muted)] mb-4" />
                            <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Mesa de Soporte Central</h4>
                            <p className="text-[11px] text-[var(--text-muted)] font-bold mt-1 max-w-xs">Selecciona un chat activo del listado lateral para ver e iniciar la conversación.</p>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default HelpDeskModule;