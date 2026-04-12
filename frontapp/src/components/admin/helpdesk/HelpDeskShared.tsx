import React from 'react';
import { Priority } from '@/lib/types/admin/helpdesk';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const classes: Record<string, string> = {
        'Abierto': 'bg-emerald-500 text-white',
        'abierto': 'bg-emerald-500 text-white',
        'En Proceso': 'bg-amber-400 text-white',
        'proceso': 'bg-amber-400 text-white',
        'Resuelto': 'bg-sky-500 text-white',
        'resuelto': 'bg-sky-500 text-white',
        'Cerrado': 'bg-red-500 text-white',
        'cerrado': 'bg-red-500 text-white',
        'Reabierto': 'bg-cyan-600 text-white',
        'reabierto': 'bg-cyan-600 text-white'
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider ${classes[status] || 'bg-[var(--bg-muted)] text-[var(--text-inverted)]'}`}>
            {status}
        </span>
    );
};

export const PriorityDot: React.FC<{ priority: string }> = ({ priority }) => {
    const classes: Record<string, string> = {
        'Baja': 'bg-gray-300',
        'baja': 'bg-gray-300',
        'Media': 'bg-sky-400',
        'media': 'bg-sky-400',
        'Alta': 'bg-amber-400',
        'alta': 'bg-amber-400',
        'Crítica': 'bg-red-500',
        'critica': 'bg-red-500'
    };

    return <span className={`w-2.5 h-2.5 rounded-full ${classes[priority] || 'bg-[var(--bg-muted)]'}`} />;
};

export const glassCardClass = "bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border-subtle)] rounded-[2rem] shadow-sm";
export const scrollbarClass = "overflow-y-auto pr-2 custom-scrollbar";
