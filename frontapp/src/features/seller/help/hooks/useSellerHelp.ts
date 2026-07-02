import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEcho } from '@laravel/echo-react';
import { SellerTicket, SellerTicketMessage, SellerTicketFilters } from '../types';
import { ticketApi } from '@/lib/api/ticketRepository';
import type { Ticket, TicketMessage, TicketPriority } from '@/modules/helpdesk/types';

type CreateData = {
  subject: string;
  description: string;
  category: SellerTicket['category'];
  priority?: TicketPriority;
};

const BACKEND_TO_CATEGORY: Record<string, SellerTicket['category']> = {
  tech: 'tecnico',
  admin: 'critico',
  info: 'informacion',
  comment: 'positivo',
  followup: 'informacion',
  payments: 'informacion',
  documentation: 'informacion',
};

function mapBackendCategory(c: string): SellerTicket['category'] {
  return BACKEND_TO_CATEGORY[c] ?? 'informacion';
}

function toSellerTicket(t: Ticket): SellerTicket {
  return {
    id: String(t.id),
    ticketNumber: t.numero || t.id_display,
    subject: t.titulo,
    description: t.descripcion,
    category: mapBackendCategory(t.categoria || t.type || 'info'),
    priority: (t.prioridad || 'media') as SellerTicket['priority'],
    status: mapStatus(t.status || t.estado || 'abierto'),
    createdAt: t.fecha_creacion || t.created_at || '',
    updatedAt: t.fecha_actualizacion || t.updated_at || '',
    messages: (t.mensajes || []).map(toSellerMessage),
  };
}

function toSellerMessage(m: TicketMessage): SellerTicketMessage {
  const isAgent = m.role?.toLowerCase() === 'admin';
  return {
    id: String(m.id),
    ticketId: String(m.id),
    senderId: m.user || '0',
    senderName: m.usuario || m.user || 'Usuario',
    senderType: isAgent ? 'agent' : 'seller',
    content: m.contenido || m.texto || '',
    createdAt: m.timestamp || m.hora || '',
  };
}

function mapStatus(s: string): SellerTicket['status'] {
  switch (s) {
    case 'abierto': return 'open';
    case 'proceso': return 'in_progress';
    case 'resuelto': return 'resolved';
    case 'cerrado': return 'closed';
    case 'reabierto': return 'open';
    default: return 'open';
  }
}

export function useSellerHelp() {
  const [tickets, setTickets] = useState<SellerTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SellerTicketFilters>({
    status: 'all',
    category: 'all',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const fetchTicketDetail = useCallback(async (id: string) => {
    try {
      const data = await ticketApi.seller.get(Number(id));
      const mapped = toSellerTicket(data);
      setTickets((prev) => prev.map((t) => (t.id === id ? mapped : t)));
    } catch {
      // silent
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await ticketApi.seller.list();
      setTickets(data.map(toSellerTicket));
    } catch {
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (activeTicketId) {
      fetchTicketDetail(activeTicketId);
    }
  }, [activeTicketId, fetchTicketDetail]);

  // WebSocket: mensajes de soporte en tiempo real
  useEcho(
    `ticket.${activeTicketId ?? 0}`,
    'TicketMessageReceived',
    () => {
      if (activeTicketId) fetchTicketDetail(activeTicketId);
    },
    [activeTicketId, fetchTicketDetail],
  );

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) ?? null,
    [tickets, activeTicketId],
  );

  const openTicketsCount = useMemo(
    () => tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    [tickets],
  );

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeTicketId) return;
    setIsSending(true);
    const tempMsg: SellerTicketMessage = {
      id: `temp-${Date.now()}`,
      ticketId: activeTicketId,
      senderId: '',
      senderName: 'Tú',
      senderType: 'seller',
      content,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId ? { ...t, messages: [...t.messages, tempMsg] } : t,
      ),
    );
    try {
      await ticketApi.seller.sendMessage(Number(activeTicketId), { content });
      await fetchTicketDetail(activeTicketId);
    } catch {
      await fetchTicketDetail(activeTicketId).catch(() => {});
    } finally {
      setIsSending(false);
    }
  }, [activeTicketId, fetchTicketDetail]);

  const handleCreateTicket = useCallback(async (data: CreateData) => {
    setIsSending(true);
    const CATEGORY_TO_BACKEND: Record<string, string> = {
      informacion: 'info',
      positivo: 'comment',
      negativo: 'comment',
      tecnico: 'tech',
      critico: 'admin',
    };
    try {
      const created = await ticketApi.seller.create({
        asunto: data.subject,
        mensaje: data.description,
        tipo_ticket: (CATEGORY_TO_BACKEND[data.category] ?? data.category) as any,
        criticidad: data.priority || 'media',
      });
      const mapped = toSellerTicket(created);
      setTickets((prev) => [mapped, ...prev]);
      setActiveTicketId(mapped.id);
    } catch {
      // silent
    } finally {
      setIsSending(false);
    }
  }, []);

  const handleCloseTicket = useCallback(async (id: string) => {
    setIsClosing(true);
    try {
      await ticketApi.seller.close(Number(id));
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: 'closed' as const } : t,
        ),
      );
      setActiveTicketId(null);
    } catch {
      // silent
    } finally {
      setIsClosing(false);
    }
  }, []);

  return {
    tickets,
    activeTicket,
    activeTicketId,
    setActiveTicketId,
    isLoading,
    isSending,
    isClosing,
    filters,
    setFilters,
    handleSendMessage,
    handleCreateTicket,
    handleCloseTicket,
    openTicketsCount,
  };
}
