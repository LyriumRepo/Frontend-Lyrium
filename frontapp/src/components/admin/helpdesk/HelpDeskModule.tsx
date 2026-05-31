'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Search, Plus, Filter, Store, Users } from 'lucide-react';

interface Message {
    id: number;
    sender: 'admin' | 'seller' | 'client';
    name: string;
    role: string;
    text: string;
    time: string;
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

export const HelpDeskModule: React.FC<any> = () => {

    const [vendedorConversations, setVendedorConversations] = useState<Conversation[]>([
        {
            id: 1,
            avatar: 'J',
            name: 'Tienda Ecológica Cusco',
            contact: 'Juan Pérez (Propietario)',
            tag: 'Logística',
            date: '11 mar.',
            messages: [
                {
                    id: 1,
                    sender: 'admin',
                    name: 'TÚ',
                    role: 'Administrador',
                    text: 'Hola Juan, queremos verificar si el último lote de fertilizantes orgánicos ya cuenta con la certificación SENASA para su publicación.',
                    time: '10:00 a. m.'
                },
                {
                    id: 2,
                    sender: 'seller',
                    name: 'JUAN PÉREZ',
                    role: 'Vendedor',
                    text: '¡Hola! Sí, estimado. La guía de remisión y el certificado orgánico de Cusco ya fueron cargados en la sección de documentos de la tienda.',
                    time: '10:15 a. m.'
                }
            ]
        },
        {
            id: 2,
            avatar: 'M',
            name: 'Moda Organica & Co.',
            contact: 'María Silva (Diseñadora)',
            tag: 'Catálogo',
            date: '10 mar.',
            messages: [
                {
                    id: 1,
                    sender: 'admin',
                    name: 'TÚ',
                    role: 'Administrador',
                    text: 'Hola María, el área de control de calidad aprobó tus aceites esenciales de lavanda y chía. Ya puedes activar el stock.',
                    time: '09:00 a. m.'
                },
                {
                    id: 2,
                    sender: 'seller',
                    name: 'MARÍA SILVA',
                    role: 'Vendedor',
                    text: '¡Excelente noticia! Muchas gracias por el soporte rápido. Acabo de subir 50 unidades en el almacén digital.',
                    time: '09:05 a. m.'
                }
            ]
        },
        {
            id: 3,
            avatar: 'A',
            name: 'Apicultura Sierra Verde',
            contact: 'Alberto Ríos (Fundador)',
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
                    time: '02:45 p. m.'
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
                    time: '11:20 a. m.'
                }
            ]
        },
        {
            id: 102,
            avatar: 'S',
            name: 'Sofía Valdivia',
            contact: 'sofia.val@email.com',
            tag: 'Consulta Puntos',
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
                    time: '04:12 p. m.'
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
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChatId, activeChat?.messages, activeMode]);

  
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
            time: formattedTime
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

    const filteredConversations = currentConversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full flex flex-col gap-6 font-industrial animate-fadeIn pb-12">
            
            {/* ── Cabecera Principal Estilo Imagen ── */}
            <div className="bg-gradient-to-r from-emerald-950 to-zinc-900 text-white p-6 rounded-[2rem] border border-emerald-900/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-900/40 p-3 rounded-2xl text-emerald-400 border border-emerald-500/10">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none">
                            {activeMode === 'vendedores' ? 'Chat con Vendedores' : 'Chat con Clientes'}
                        </h1>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1.5">Mesa de Ayuda Centralizada</p>
                    </div>
                </div>
                <button 
                    onClick={() => alert('Crear nueva sala de soporte')}
                    className="bg-white hover:bg-zinc-100 text-emerald-950 px-6 py-3.5 rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nuevo Chat
                </button>
            </div>

            {/* ── Selector de Modo: Vendedores vs Clientes (RF-11/12) ── */}
            <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[1.8rem] w-full max-w-md border border-[var(--border-subtle)]/50 backdrop-blur-sm shadow-inner">
                <button
                    onClick={() => handleModeChange('vendedores')}
                    className={`flex-1 py-3.5 rounded-[1.4rem] text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                        activeMode === 'vendedores'
                            ? 'bg-[var(--bg-card)] text-emerald-500 shadow-md border border-[var(--border-subtle)]/30'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                    }`}
                >
                    <Store className="w-4 h-4" /> Canal Vendedores
                </button>
                <button
                    onClick={() => handleModeChange('clientes')}
                    className={`flex-1 py-3.5 rounded-[1.4rem] text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                        activeMode === 'clientes'
                            ? 'bg-[var(--bg-card)] text-emerald-500 shadow-md border border-[var(--border-subtle)]/30'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                    }`}
                >
                    <Users className="w-4 h-4" /> Canal Clientes
                </button>
            </div>

            {/* ── Cuerpo Principal de Dos Columnas ── */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[550px]">
                
                {/* ── Columna Izquierda: Conversaciones ── */}
                <div className="w-full lg:w-96 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] p-6 flex flex-col shadow-sm gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Conversaciones</h2>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5">{filteredConversations.length} chats activos</p>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                        <input
                            type="text"
                            placeholder={activeMode === 'vendedores' ? "Buscar vendedor..." : "Buscar cliente..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-secondary)] border-none rounded-xl text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold"
                        />
                    </div>

                    {/* Lista de Chats */}
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[450px] pr-1 scrollbar-thin">
                        {filteredConversations.map((chat) => {
                            const isActive = chat.id === activeChatId;
                            const lastMsg = chat.messages[chat.messages.length - 1];
                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChatId(chat.id)}
                                    className={`p-4 rounded-2xl flex gap-3.5 cursor-pointer transition-all border ${
                                        isActive
                                            ? 'bg-emerald-950/10 border-emerald-500/20 dark:bg-emerald-950/20'
                                            : 'hover:bg-[var(--bg-secondary)]/50 border-transparent'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-500/10">
                                        {chat.avatar}
                                    </div>
                                    
                                    {/* Textos */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-xs font-black text-[var(--text-primary)] truncate">{chat.name}</h3>
                                            <span className="text-[9px] text-[var(--text-muted)] font-bold shrink-0">{chat.date}</span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-1 font-medium">
                                            {lastMsg ? lastMsg.text : 'No hay mensajes'}
                                        </p>
                                        <span className="inline-block bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-2 border border-[var(--border-subtle)]">
                                            {chat.tag}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Columna Derecha: Chat Activo ── */}
                <div className="flex-1 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] flex flex-col overflow-hidden shadow-sm">
                    
                    {activeChat ? (
                        <>
                            {/* Header del Chat */}
                            <div className="p-5 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/10">
                                    {activeChat.avatar}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-[var(--text-primary)] leading-none">{activeChat.name}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1.5 uppercase tracking-widest">{activeChat.contact}</p>
                                </div>
                            </div>

                            {/* Contenedor de Mensajes */}
                            <div className="p-8 flex-1 overflow-y-auto space-y-6 max-h-[380px] min-h-[350px] bg-[var(--glass-bg)]">
                                {activeChat.messages.map((msg) => {
                                    const isAdmin = msg.sender === 'admin';
                                    return (
                                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] p-5 rounded-3xl relative flex flex-col gap-1.5 shadow-sm ${
                                                isAdmin
                                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                                    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-subtle)]'
                                            }`}>
                                                {/* Remitente */}
                                                <div className={`text-[9px] font-black uppercase tracking-wider ${
                                                    isAdmin ? 'text-emerald-100' : 'text-indigo-500 dark:text-indigo-400'
                                                }`}>
                                                    {msg.name} <span className="opacity-75 font-normal">({msg.role})</span>
                                                </div>
                                                {/* Texto */}
                                                <p className="text-xs font-semibold leading-relaxed">{msg.text}</p>
                                                {/* Hora */}
                                                <span className={`text-[8px] font-bold text-right self-end mt-1 ${
                                                    isAdmin ? 'text-emerald-200' : 'text-[var(--text-muted)]'
                                                }`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Footer y Input de Chat */}
                            <div className="p-5 bg-[var(--bg-secondary)]/30 border-t border-[var(--border-subtle)]">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-center relative">
                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje..."
                                        value={typedMessage}
                                        onChange={(e) => setTypedMessage(e.target.value)}
                                        className="flex-1 pl-6 pr-14 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-full text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none text-[var(--text-primary)]"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2.5 w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-emerald-500/10"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)]">
                            <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">No hay una conversación activa</p>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default HelpDeskModule;