import React from 'react';
import { FAQArticle, AuditEntry, ActionType } from '@/lib/types/admin/helpdesk';
import { scrollbarClass, glassCardClass } from './HelpDeskShared';
import BaseButton from '@/components/ui/BaseButton';
import { Search, PlusCircle, ShieldCheck, ThumbsUp, ThumbsDown } from 'lucide-react';

// --- FAQ VIEW ---
interface FAQViewProps {
    articles: FAQArticle[];
    onCreateClick: () => void;
    onSearchChange: (q: string) => void;
    onDetailClick: (id: number) => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ articles, onCreateClick, onSearchChange, onDetailClick }) => {
    return (
        <div className="animate-fadeIn">
            <div className={`${glassCardClass} p-6 flex flex-wrap items-center justify-between gap-6 mb-8`}>
                <div className="flex-1 max-w-xl relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="¿Qué estás buscando? (Ej: Pagos, Logística...)"
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-[var(--bg-input)] border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-sky-500/20 font-industrial"
                    />
                </div>
                <BaseButton
                    onClick={onCreateClick}
                    variant="secondary"
                    leftIcon="PlusCircle"
                    size="md"
                >
                    Crear Artículo
                </BaseButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(f => (
                    <div key={f.id} className={`${glassCardClass} p-6 flex flex-col justify-between hover:border-sky-500/50 transition-all cursor-pointer group`}>
                        <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-600 mb-4 font-industrial">{f.categoria}</span>
                            <h4 className="text-base font-black text-[var(--text-primary)] tracking-tight mb-2 group-hover:text-sky-600 transition-colors font-industrial uppercase">{f.titulo}</h4>
                            <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2 font-industrial">{f.contenido}</p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex justify-between items-center">
                            <div className="flex gap-3 text-[10px] font-bold text-[var(--text-muted)] font-industrial">
                                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> {f.util_si}</span>
                                <span className="flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5 text-red-400" /> {f.util_no}</span>
                            </div>
                            <button
                                onClick={() => onDetailClick(f.id)}
                                className="text-[10px] font-black text-sky-500 uppercase tracking-widest font-industrial"
                            >
                                Leer más
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- AUDIT TABLE ---
interface AuditTableProps {
    entries: AuditEntry[];
    filters: { search: string; date: string; type: ActionType | '' };
    onFilterChange: (f: { search?: string; date?: string; type?: ActionType | '' }) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({ entries, filters, onFilterChange }) => {
    const getBadgeClass = (action: ActionType) => {
        const map = {
            'Escalamiento': 'bg-amber-100 text-amber-600',
            'Cierre': 'bg-red-100 text-red-600',
            'Respuesta': 'bg-sky-100 text-sky-600',
            'Asignación': 'bg-blue-100 text-blue-600',
            'Cambio Prioridad': 'bg-purple-100 text-purple-600'
        };
        return map[action] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="animate-fadeIn">
            <div className={`${glassCardClass} p-8 mb-8`}>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3 font-industrial uppercase">
                    <ShieldCheck className="w-6 h-6 text-sky-500" /> Log de Transacciones Inmutables
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="helpdesk-search" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2 block font-industrial">Tienda / Responsable</label>
                        <input
                            id="helpdesk-search"
                            type="text"
                            value={filters.search}
                            onChange={(e) => onFilterChange({ search: e.target.value })}
                            placeholder="Buscar..."
                            className="w-full px-4 py-3 bg-[var(--bg-input)] border-none rounded-xl text-xs font-bold font-industrial"
                        />
                    </div>
                    <div>
                        <label htmlFor="helpdesk-date" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2 block font-industrial">Fecha</label>
                        <input
                            id="helpdesk-date"
                            type="date"
                            value={filters.date}
                            onChange={(e) => onFilterChange({ date: e.target.value })}
                            className="w-full px-4 py-3 bg-[var(--bg-input)] border-none rounded-xl text-xs font-bold font-industrial"
                        />
                    </div>
                    <div>
                        <label htmlFor="helpdesk-type" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2 block font-industrial">Tipo de Acción</label>
                        <select
                            id="helpdesk-type"
                            value={filters.type}
                            onChange={(e) => onFilterChange({ type: e.target.value as ActionType | '' })}
                            className="w-full px-4 py-3 bg-[var(--bg-input)] border-none rounded-xl text-xs font-bold font-industrial"
                        >
                            <option value="">Todas</option>
                            <option value="Escalamiento">Escalamiento</option>
                            <option value="Cierre">Cierre</option>
                            <option value="Respuesta">Respuesta</option>
                            <option value="Asignación">Asignación</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={`${glassCardClass} overflow-hidden`}>
                <div className={`max-h-[600px] ${scrollbarClass}`}>
                    <table className="w-full text-left font-industrial">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)]/50 sticky top-0 z-10 backdrop-blur-md">
                                <th className="p-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Timestamp</th>
                                <th className="p-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tienda Relacionada</th>
                                <th className="p-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Acción Efectuada</th>
                                <th className="p-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Responsable</th>
                                <th className="p-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Detalle / Justificación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {entries.map(a => (
                                <tr key={a.id} className="hover:bg-[var(--bg-card)]/50 transition-all group">
                                    <td className="p-5 text-xs font-bold text-[var(--text-secondary)]">{a.timestamp}</td>
                                    <td className="p-5 text-xs font-black text-[var(--text-primary)] group-hover:text-sky-600 transition-colors">{a.tienda}</td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider ${getBadgeClass(a.accion)}`}>
                                            {a.accion}
                                        </span>
                                    </td>
                                    <td className="p-5 text-xs font-bold text-[var(--text-muted)]">{a.responsable}</td>
                                    <td className="p-5 text-xs font-medium text-[var(--text-secondary)] italic">{a.detalles}</td>
                                </tr>
                            ))}
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-[var(--text-muted)] font-bold italic">No se encontraron registros de auditoría</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
