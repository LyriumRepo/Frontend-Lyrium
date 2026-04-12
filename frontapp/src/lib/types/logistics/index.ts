export type ShipmentStatus = 
    | 'ASIGNADO' 
    | 'RECOGIDO' 
    | 'EN_TRÁNSITO' 
    | 'EN_DESTINO' 
    | 'ENTREGADO' 
    | 'INCIDENCIA' 
    | 'REAGENDADO';

export interface Shipment {
    id: string;
    orderId: string;
    vendorId: number;
    vendorName: string;
    customerName: string;
    customerPhone: string;
    address: string;
    district: string;
    status: ShipmentStatus;
    previousStatus?: ShipmentStatus;
    notes?: string;
    assignedAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
    deliveredAt?: string;
}

export interface LogisticsKPI {
    label: string;
    value: number | string;
    icon: string;
    color: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet';
}

export interface LogisticsConversation {
    id: string;
    vendorId: number;
    vendorName: string;
    orderId: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: LogisticsMessage[];
}

export interface LogisticsMessage {
    id: string;
    sender: 'operator' | 'vendor';
    senderName: string;
    content: string;
    timestamp: string;
    read: boolean;
}

export interface LogisticsTicket {
    id: string;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
    messages: LogisticsTicketMessage[];
}

export interface LogisticsTicketMessage {
    id: string;
    sender: 'operator' | 'admin';
    senderName: string;
    content: string;
    timestamp: string;
}
