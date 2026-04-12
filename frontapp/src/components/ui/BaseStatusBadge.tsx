'use client';

import React from 'react';
import Icon from './Icon';

export interface StatusMapping {
    status: string;
    label: string;
    class: string;
    icon?: string;
}

export const ORDER_STATUS_MAPPINGS: StatusMapping[] = [
    { status: 'pagado', label: 'Confirmado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
    { status: 'en_proceso', label: 'En Proceso', class: 'bg-blue-100 text-blue-700', icon: 'Truck' },
    { status: 'entregado', label: 'Completado', class: 'bg-indigo-100 text-indigo-700', icon: 'Flag' },
    { status: 'pendiente', label: 'Pendiente', class: 'bg-amber-100 text-amber-700', icon: 'Hourglass' },
    { status: 'cancelado', label: 'Cancelado', class: 'bg-red-100 text-red-700', icon: 'Ban' },
    { status: 'verificado', label: 'Verificado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
    { status: 'procesando', label: 'Procesando', class: 'bg-sky-100 text-sky-700', icon: 'Loader' },
    { status: 'enviado', label: 'Enviado', class: 'bg-purple-100 text-purple-700', icon: 'Truck' },
    { status: 'transito', label: 'En Tránsito', class: 'bg-violet-100 text-violet-700', icon: 'Truck' }
];

export const VOUCHER_STATUS_MAPPINGS: StatusMapping[] = [
    { status: 'DRAFT', label: 'Borrador', class: 'bg-gray-100 text-gray-600', icon: 'FileText' },
    { status: 'SENT_WAIT_CDR', label: 'Enviado', class: 'bg-amber-100 text-amber-700', icon: 'Clock' },
    { status: 'ACCEPTED', label: 'Aceptado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle2' },
    { status: 'OBSERVED', label: 'Observado', class: 'bg-orange-100 text-orange-700', icon: 'AlertTriangle' },
    { status: 'REJECTED', label: 'Rechazado', class: 'bg-red-100 text-red-700', icon: 'XCircle' },
    { status: 'PENDING', label: 'Pendiente', class: 'bg-amber-100 text-amber-700', icon: 'Clock' },
    { status: 'PAID', label: 'Pagado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' }
];

export const TICKET_STATUS_MAPPINGS: StatusMapping[] = [
    { status: 'abierto', label: 'Abierto', class: 'bg-emerald-400 text-white', icon: 'Circle' },
    { status: 'proceso', label: 'En Proceso', class: 'bg-lime-400 text-white', icon: 'Loader' },
    { status: 'resuelto', label: 'Resuelto', class: 'bg-sky-500 text-white', icon: 'CheckCircle' },
    { status: 'cerrado', label: 'Cerrado', class: 'bg-red-500 text-white', icon: 'XCircle' },
    { status: 'Abierto', label: 'Abierto', class: 'bg-emerald-500 text-white', icon: 'Circle' },
    { status: 'En Proceso', label: 'En Proceso', class: 'bg-amber-400 text-white', icon: 'Loader' },
    { status: 'Resuelto', label: 'Resuelto', class: 'bg-sky-500 text-white', icon: 'CheckCircle' },
    { status: 'Cerrado', label: 'Cerrado', class: 'bg-red-500 text-white', icon: 'XCircle' }
];

export const CONTRACT_STATUS_MAPPINGS: StatusMapping[] = [
    { status: 'ACTIVE', label: 'Vigente', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
    { status: 'PENDING', label: 'Pendiente', class: 'bg-amber-100 text-amber-700', icon: 'Clock' },
    { status: 'EXPIRED', label: 'Vencido', class: 'bg-red-100 text-red-700', icon: 'XCircle' }
];

export const DEFAULT_STATUS_MAPPINGS: StatusMapping[] = [
    { status: 'active', label: 'Activo', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
    { status: 'inactive', label: 'Inactivo', class: 'bg-gray-100 text-gray-600', icon: 'Circle' },
    { status: 'enabled', label: 'Habilitado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
    { status: 'disabled', label: 'Deshabilitado', class: 'bg-gray-100 text-gray-600', icon: 'Circle' }
];

export type StatusBadgeVariant = 'default' | 'large' | 'small';

interface StatusBadgeProps {
    status: string;
    mappings?: StatusMapping[];
    variant?: StatusBadgeVariant;
    showIcon?: boolean;
    customClass?: string;
}

export default function BaseStatusBadge({
    status,
    mappings = ORDER_STATUS_MAPPINGS,
    variant = 'default',
    showIcon = true,
    customClass = ''
}: StatusBadgeProps) {
    const mapping = mappings.find(m => m.status === status) || {
        status,
        label: status,
        class: 'bg-gray-100 text-gray-600'
    };

    const sizeClasses: Record<StatusBadgeVariant, string> = {
        small: 'px-1.5 py-0.5 text-[7px]',
        default: 'px-2 py-0.5 text-[8px]',
        large: 'px-3 py-1.5 text-[10px]'
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-lg font-extrabold uppercase tracking-wider ${sizeClasses[variant]} ${mapping.class} ${customClass}`}>
            {showIcon && mapping.icon && <Icon name={mapping.icon} className="w-3 h-3" />}
            {mapping.label}
        </span>
    );
}
