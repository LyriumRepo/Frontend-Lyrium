import React from 'react';
import Icon from './Icon';

interface StatusMapping {
  status: string;
  label: string;
  class: string;
  icon?: string;
}

interface BaseStatusBadgeProps {
  status: string;
  mappings: StatusMapping[];
  variant?: 'default' | 'large';
  customClass?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ORDER_STATUS_MAPPINGS: StatusMapping[] = [
  { status: 'pending', label: 'Pendiente', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'Clock' },
  { status: 'processing', label: 'Procesando', class: 'bg-sky-50 text-sky-600 border-sky-100', icon: 'RefreshCw' },
  { status: 'completed', label: 'Completado', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'CheckCircle' },
  { status: 'cancelled', label: 'Cancelado', class: 'bg-rose-50 text-rose-600 border-rose-100', icon: 'XCircle' },
];

export const VOUCHER_STATUS_MAPPINGS: StatusMapping[] = [
  { status: 'ACCEPTED', label: 'Aceptado', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'CheckCircle' },
  { status: 'SENT_WAIT_CDR', label: 'Pendiente CDR', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'Clock' },
  { status: 'REJECTED', label: 'Rechazado', class: 'bg-rose-50 text-rose-600 border-rose-100', icon: 'XCircle' },
  { status: 'OBSERVED', label: 'Observado', class: 'bg-orange-50 text-orange-600 border-orange-100', icon: 'AlertCircle' },
  { status: 'DRAFT', label: 'Borrador', class: 'bg-gray-50 text-gray-600 border-gray-100', icon: 'FileText' },
];

export default function BaseStatusBadge({
  status,
  mappings,
  variant = 'default',
  customClass = '',
  className = '',
}: BaseStatusBadgeProps) {
  const mapping = mappings.find((m) => m.status === status);

  if (!mapping) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-100 ${customClass} ${className}`}
      >
        {status}
      </span>
    );
  }

  const sizeClass = variant === 'large' ? 'px-4 py-1.5 text-xs' : 'px-3 py-1 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClass} rounded-full font-black uppercase tracking-wider border ${mapping.class} ${customClass} ${className}`}
    >
      {mapping.icon && (
        <Icon name={mapping.icon} className="w-3.5 h-3.5" />
      )}
      {mapping.label}
    </span>
  );
}
