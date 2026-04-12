export type Priority = 'baja' | 'media' | 'alta' | 'critica';
export type TicketStatus = 'abierto' | 'proceso' | 'resuelto' | 'cerrado' | 'reabierto';
export type ActionType = 'Escalamiento' | 'Cierre' | 'Respuesta' | 'Asignación' | 'Cambio Prioridad';
export type TicketType = 'tech' | 'admin' | 'info' | 'comment' | 'followup' | 'payments' | 'documentation';

export type { Ticket, TicketUser, TicketMessage, TicketFilters, CreateTicketPayload, SendMessagePayload, SubmitSurveyPayload } from '@/modules/helpdesk/types';
export { TICKET_TYPE_LABELS, TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from '@/modules/helpdesk/types';

export interface User {
    id: number;
    nombre: string;
    empresa?: string;
}

export interface Message {
    id: number;
    usuario: string;
    contenido: string;
    timestamp: string;
    archivo?: string | null;
    leido: boolean;
    tipo?: 'normal' | 'respuesta_rapida' | 'escalamiento' | 'sistema';
}

export interface FAQArticle {
    id: number;
    titulo: string;
    categoria: string;
    contenido: string;
    visitas: number;
    util_si: number;
    util_no: number;
    palabras_clave: string[];
}

export interface AuditEntry {
    id: number;
    tienda: string;
    accion: ActionType;
    timestamp: string;
    responsable: string;
    detalles: string;
}

export interface Admin {
    id: number;
    nombre: string;
    rol: string;
}

export interface MesaAyudaData {
    tickets: Ticket[];
    faq: FAQArticle[];
    vendedores: User[];
    admins: Admin[];
    auditoria: AuditEntry[];
}

export interface AdminTicketFilters {
    search: string;
    status: TicketStatus | '';
    priority: Priority | '';
}

export const PRIORITY_LABELS: Record<Priority, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
    abierto: 'Abierto',
    proceso: 'En Proceso',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
    reabierto: 'Reabierto',
};

import type { Ticket } from '@/modules/helpdesk/types';
