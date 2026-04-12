import React from 'react';

export const CVStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, string> = {
        'activa': 'bg-emerald-500 text-white border-transparent',
        'ACTIVE': 'bg-emerald-500 text-white border-transparent',
        'suspendida': 'bg-orange-500 text-white border-transparent',
        'SUSPENDED': 'bg-orange-500 text-white border-transparent',
        'baja_logica': 'bg-red-500 text-white border-transparent',
        'REJECTED': 'bg-red-500 text-white border-transparent',
        'aprobado': 'bg-emerald-500 text-white border-transparent',
        'APPROVED': 'bg-emerald-500 text-white border-transparent',
        'en_espera': 'bg-lime-500 text-white border-transparent',
        'PENDING': 'bg-lime-500 text-white border-transparent',
        'rechazado': 'bg-red-500 text-white border-transparent',
    };

    return (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${map[status] || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
            {status}
        </span>
    );
};

export const CVCard: React.FC<{ children: React.ReactNode, className?: string, border?: string }> = ({ children, className = "", border = "" }) => (
    <div className={`overflow-hidden bg-[var(--bg-card)]/60 backdrop-blur-md border ${border || 'border-[var(--border-subtle)]/50'} rounded-[2rem] ${className}`}>
        {children}
    </div>
);
