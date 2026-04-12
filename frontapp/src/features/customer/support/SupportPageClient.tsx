'use client';

import React, { useState } from 'react';
import { useCustomerSupport } from '@/features/customer/support/hooks/useCustomerSupport';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import { CustomerTicket, TicketStatus, TicketCategory } from '@/features/customer/support/types';

function TicketList({ 
    tickets, 
    activeTicketId, 
    onSelect 
}: { 
    tickets: CustomerTicket[]; 
    activeTicketId: string | null;
    onSelect: (id: string) => void;
}) {
    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-emerald-100 text-emerald-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: TicketStatus) => {
        switch (status) {
            case 'open': return 'Abierto';
            case 'in_progress': return 'En proceso';
            case 'pending': return 'Pendiente';
            case 'resolved': return 'Resuelto';
            case 'closed': return 'Cerrado';
            default: return status;
        }
    };

    const getCategoryLabel = (category: TicketCategory) => {
        switch (category) {
            case 'technical': return 'Técnico';
            case 'billing': return 'Facturación';
            case 'order': return 'Pedido';
            case 'shipping': return 'Envío';
            case 'general': return 'General';
            default: return category;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="flex flex-col h-full min-h-0 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Mis Tickets</h3>
                <p className="text-sm text-gray-500">{tickets.length} tickets</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {tickets.map((ticket) => (
                    <button
                        key={ticket.id}
                        onClick={() => onSelect(ticket.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            activeTicketId === ticket.id ? 'bg-sky-50' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-gray-400">#{ticket.ticketNumber}</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                </div>
                                <h4 className="font-medium text-gray-900 truncate">{ticket.subject}</h4>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-gray-400">{getCategoryLabel(ticket.category)}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
                {tickets.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <p>No hay tickets</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TicketChat({ 
    ticket, 
    onSendMessage, 
    onCloseTicket,
    isSending,
    isClosing 
}: { 
    ticket: CustomerTicket; 
    onSendMessage: (content: string) => void;
    onCloseTicket: () => void;
    isSending: boolean;
    isClosing: boolean;
}) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-emerald-100 text-emerald-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500">#{ticket.ticketNumber} • {formatDate(ticket.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Abierto' : 
                         ticket.status === 'in_progress' ? 'En proceso' :
                         ticket.status === 'pending' ? 'Pendiente' :
                         ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                    </span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {ticket.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No hay mensajes aún</p>
                        <p className="text-sm">Envía un mensaje para comenzar la conversación</p>
                    </div>
                ) : (
                    ticket.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${
                                msg.senderType === 'customer'
                                    ? 'bg-emerald-500 text-white rounded-tr-none'
                                    : 'bg-sky-500 text-white rounded-tl-none'
                            }`}>
                                <p className="text-xs font-medium mb-1 opacity-80">{msg.senderName}</p>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${msg.senderType === 'customer' ? 'text-emerald-200' : 'text-sky-200'}`}>
                                    {formatTime(msg.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {ticket.status !== 'resolved' && (
                <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-sky-500"
                            disabled={isSending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isSending || !message.trim()}
                            className="px-4 py-2 bg-sky-500 text-white rounded-full font-medium disabled:opacity-50 hover:bg-sky-600 transition-colors"
                        >
                            {isSending ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                    {['open', 'in_progress', 'pending'].includes(ticket.status as TicketStatus) && (
                        <button
                            onClick={onCloseTicket}
                            disabled={isClosing}
                            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                            {isClosing ? 'Cerrando...' : 'Cerrar ticket'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function NewTicketForm({ 
    onSubmit, 
    onCancel, 
    isSubmitting 
}: { 
    onSubmit: (data: { subject: string; description: string; category: string; priority: string }) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('general');
    const [priority, setPriority] = useState('medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ subject, description, category, priority });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Nuevo Ticket</h3>
                <p className="text-sm text-gray-500">Crea una nueva solicitud de soporte</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                        required
                    >
                        <option value="general">General</option>
                        <option value="order">Pedido</option>
                        <option value="shipping">Envío</option>
                        <option value="billing">Facturación</option>
                        <option value="technical">Técnico</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Prioridad</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Asunto</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Describe brevemente el problema"
                        className="w-full px-4 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explica detalladamente tu problema..."
                        rows={5}
                        className="w-full px-4 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                        required
                    />
                </div>

                <div className="flex gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creando...' : 'Crear Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function SupportPageClient() {
    const {
        tickets,
        activeTicket,
        activeTicketId,
        setActiveTicketId,
        isLoading,
        isSending,
        isClosing,
        handleSendMessage,
        handleCreateTicket,
        handleCloseTicket,
        openTicketsCount
    } = useCustomerSupport();

    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
                <ModuleHeader
                    title="Mesa de Ayuda"
                    subtitle="Centro de soporte y gestión de incidencias"
                    icon="Headset"
                />
                <div className="flex-1 flex items-center justify-center">
                    <BaseLoading message="Cargando tickets de soporte..." />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
            <ModuleHeader
                title="Mesa de Ayuda"
                subtitle="Centro de soporte y gestión de incidencias"
                icon="Headset"
                actions={
                    !showNewTicketForm && !activeTicket ? (
                        <button
                            onClick={() => setShowNewTicketForm(true)}
                            className="px-4 py-2 bg-white text-sky-600 rounded-xl font-medium hover:bg-sky-50 transition-colors"
                        >
                            + Nuevo Ticket
                        </button>
                    ) : null
                }
            />
            
            <div className="flex-1 flex gap-4 overflow-hidden">
                {!showNewTicketForm && (
                    <div className="w-96 shrink-0">
                        <TicketList
                            tickets={tickets}
                            activeTicketId={activeTicketId}
                            onSelect={setActiveTicketId}
                        />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    {showNewTicketForm ? (
                        <NewTicketForm
                            onSubmit={(data) => {
                                handleCreateTicket(data);
                                setShowNewTicketForm(false);
                            }}
                            onCancel={() => setShowNewTicketForm(false)}
                            isSubmitting={isSending}
                        />
                    ) : activeTicket ? (
                        <TicketChat
                            ticket={activeTicket}
                            onSendMessage={handleSendMessage}
                            onCloseTicket={() => handleCloseTicket(activeTicket.id)}
                            isSending={isSending}
                            isClosing={isClosing}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <p className="text-lg mb-2">Selecciona un ticket</p>
                                <p className="text-sm">O crea uno nuevo si tienes alguna consulta</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
