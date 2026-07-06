import React from 'react';
import { ContractStatus, ContractKPI, ContractModality, AuditEvent, ExpiryUrgency } from '@/lib/types/admin/contracts';
import { CheckCircle, AlertTriangle, AlertOctagon, Clock, XCircle, Handshake, Cloud } from 'lucide-react';

const colorMap: Record<string, string> = {
    emerald: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    indigo: 'bg-[var(--celeste-500)]/10 text-[var(--celeste-500)] border border-[var(--celeste-500)]/20',
    amber: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    red: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
};

const borderMap: Record<string, string> = {
    emerald: 'border-[var(--color-success)]',
    indigo: 'border-[var(--celeste-500)]',
    amber: 'border-[var(--color-warning)]',
    red: 'border-[var(--color-error)]',
};

export const StatusBadge: React.FC<{ status: ContractStatus, large?: boolean }> = ({ status, large }) => {
    const configs = {
        ACTIVE: { label: 'Vigente', class: colorMap.emerald },
        PENDING: { label: 'En Revisión / Pendiente', class: colorMap.amber },
        EXPIRED: { label: 'Rechazado', class: colorMap.red }
    };
    const config = configs[status] || configs.PENDING;
    return (
        <span className={`${large ? 'px-4 py-1.5 text-xs' : 'px-2 py-0.5 text-[9px]'} rounded-full font-black uppercase tracking-wider border font-industrial ${config.class}`}>
            {config.label}
        </span>
    );
};

export const ExpiryTrafficLight: React.FC<{ urgency?: ExpiryUrgency }> = ({ urgency }) => {
    if (!urgency) return null;
    const configs = {
        normal: { class: 'bg-[var(--color-success)]', label: 'Vigente' },
        warning: { class: 'bg-[var(--color-warning)] animate-pulse', label: 'Vence Pronto' },
        critical: { class: 'bg-red-500', label: 'Vencido' }
    };
    const config = configs[urgency];
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.class}`}></div>
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter font-industrial">{config.label}</span>
        </div>
    );
};

export const AuditTimeline: React.FC<{ events?: AuditEvent[] }> = ({ events }) => {
    if (!events || events.length === 0) {
        return (
            <div className="p-10 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-[2rem]">
                <Clock className="w-10 h-10 text-[var(--text-muted)] mb-2 mx-auto opacity-30" />
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest font-industrial">Sin historial registrado</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)] font-industrial">
            {[...events].map((event) => (
                <div key={event.timestamp + event.action} className="relative pl-10">
                    <div className="absolute left-2.5 top-1 w-3 h-3 bg-[var(--celeste-500)] rounded-full border-4 border-[var(--bg-card)] shadow-sm -ml-0.5"></div>
                    <div>
                        <p className="text-[10px] font-black text-[var(--text-primary)] leading-none mb-1 uppercase tracking-tight">{event.action}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">{new Date(event.timestamp).toLocaleString()}</span>
                            <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full"></span>
                            <span className="text-[9px] font-bold text-[var(--celeste-500)] uppercase">{event.user}</span>
                        </div>
                    </div>
                </div>
            )).reverse()}
        </div>
    );
};

export const ModalityBadge: React.FC<{ modality: ContractModality }> = ({ modality }) => {
    const isVirtual = modality === 'VIRTUAL';
    return (
        <span className={`text-[10px] font-black ${isVirtual ? 'text-[var(--color-info)]' : 'text-[var(--color-warning)]'} flex items-center gap-1 font-industrial`}>
            {isVirtual ? <Cloud className="w-4 h-4" /> : <Handshake className="w-4 h-4" />}
            {isVirtual ? 'VIRTUAL' : 'PRESENCIAL'}
        </span>
    );
};

export const KpiCard: React.FC<{ kpi: ContractKPI }> = ({ kpi }) => (
    <div className={`bg-[var(--bg-card)] p-6 border-l-4 ${borderMap[kpi.color] || 'border-[var(--celeste-500)]'} flex items-center justify-between rounded-[2rem] shadow-sm border border-[var(--border-subtle)] transition-all hover:shadow-md font-industrial`}>
        <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{kpi.val}</p>
        </div>
        <div className={`p-4 ${colorMap[kpi.color] || colorMap.indigo} rounded-2xl`}>
            {kpi.icon === 'Files' && <Clock className="w-7 h-7" />}
            {kpi.icon === 'CheckCircle' && <CheckCircle className="w-7 h-7" />}
            {kpi.icon === 'Hourglass' && <Clock className="w-7 h-7" />}
            {kpi.icon === 'AlertOctagon' && <AlertOctagon className="w-7 h-7" />}
        </div>
    </div>
);
