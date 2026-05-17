'use client';

import React from 'react';
import Image from 'next/image';
import {
    Service,
    Specialist,
    WEEK_DAY_SHORT,
    countTotalSessions,
    canPublish,
    ANTICIPACION_LABELS,
} from '@/features/seller/services/types';
import Icon from '@/components/ui/Icon';

interface ServiceCardProps {
    service: Service;
    specialists: Specialist[];
    onDetail:   (service: Service) => void;
    onEdit:     (service: Service) => void;
    onDelete:   (id: number) => void;
    /** Alterna entre 'borrador' y 'publicado' */
    onPublish:  (service: Service) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarChars(sp: Specialist): string {
    return (
        (sp.nombres?.charAt(0)?.toUpperCase() ?? '') +
        (sp.apellidos?.charAt(0)?.toUpperCase() ?? '')
    );
}

function buildScheduleSummary(service: Service): string {
    if (!service.diasAtencion || service.diasAtencion.length === 0) return 'Sin horario';
    const days  = service.diasAtencion.map((d) => WEEK_DAY_SHORT[d.dia]).join(', ');
    const total = countTotalSessions(service.diasAtencion, service.duracion);
    return `${days}  ·  ${total} sesión${total !== 1 ? 'es' : ''}`;
}

// ─── Inline SVGs ──────────────────────────────────────────────────────────────

const SvgHome = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceCard({
    service, specialists, onDetail, onEdit, onDelete, onPublish,
}: ServiceCardProps) {
    const scheduleSummary = buildScheduleSummary(service);
    const assignedSpecialists = service.especialistasAsignados
        .map((id) => specialists.find((e) => e.id === id))
        .filter((sp): sp is Specialist => !!sp);

    const isPublished  = service.estado === 'publicado';
    const publishable  = canPublish(service); // al menos 1 especialista

    return (
        <div className={`glass-card bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all group animate-fadeIn flex flex-col justify-between h-full border-l-4
            ${isPublished ? 'border-sky-500 dark:border-[#8FC3A1]' : 'border-gray-300'}`}>

            <div>
                {/* ── Header ── */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">

                        {/* Badges de estado */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {/* Estado: borrador / publicado */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider
                                ${isPublished
                                    ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] border-sky-500/20 dark:border-[#8FC3A1]/20'
                                    : 'bg-gray-300/10 text-gray-300 border-gray-300/20'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                    ${isPublished ? 'bg-sky-500 dark:bg-[#8FC3A1] animate-pulse' : 'bg-gray-300'}`} />
                                {isPublished ? 'Publicado' : 'Borrador'}
                            </span>

                            {/* Categoría */}
                            {service.categoria && (
                                <span className="px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] border-sky-500/20 dark:border-[#8FC3A1]/20 whitespace-nowrap">
                                    {service.categoria}
                                </span>
                            )}

                            {/* A domicilio */}
                            {service.domicilio && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] border-sky-500/20 dark:border-[#8FC3A1]/20">
                                    <SvgHome /> Domicilio
                                </span>
                            )}
                        </div>

                        {/* Denominación */}
                        <h3 className="font-black text-[var(--text-primary)] tracking-tight truncate">
                            {service.denominacion}
                        </h3>

                        {/* Horario resumido */}
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest truncate mt-0.5">
                            {scheduleSummary}
                        </p>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(service); }}
                            className="w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 rounded-lg transition-colors border border-[var(--border-subtle)]"
                            title="Editar"
                        >
                            <Icon name="Pencil" className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(service.id); }}
                            className="w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors border border-[var(--border-subtle)]"
                            title="Eliminar"
                        >
                            <Icon name="Trash2" className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Métricas ── */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                    <Metric label="Duración"
                        value={service.duracion < 60 ? `${service.duracion} min` : `${service.duracion / 60}h`}
                         />
                    <Metric label="Cupos" value={`${service.cupos} / sesión`} />
                    <Metric label="Precio" value={`S/. ${service.precio.toFixed(2)}`} />
                </div>

                {/* Anticipación */}
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-0.5 mb-1">
                    Anticipación mín.: {ANTICIPACION_LABELS[service.anticipacionReserva]}
                </p>
            </div>

            {/* ── Footer: especialistas + publicar + detalle ── */}
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-3">

                {/* Avatares de especialistas */}
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {assignedSpecialists.length === 0 ? (
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] italic">
                                Sin especialista asignado
                            </span>
                        ) : (
                            assignedSpecialists.map((esp) => (
                                <div
                                    key={esp.id}
                                    className="relative w-8 h-8 rounded-full border-2 border-[var(--bg-card)] bg-sky-500/10 dark:bg-[#8FC3A1]/10 flex items-center justify-center text-[10px] font-black overflow-hidden shadow-sm hover:scale-110 hover:z-10 transition-transform cursor-help"
                                    title={`${esp.nombres} ${esp.apellidos} · ${esp.especialidad}`}
                                >
                                    {esp.foto
                                        ? <Image src={esp.foto} alt={`${esp.nombres} ${esp.apellidos}`} fill sizes="32px" className="object-cover" />
                                        : <span className="text-sky-500 dark:text-[#8FC3A1]">{getAvatarChars(esp)}</span>
                                    }
                                </div>
                            ))
                        )}
                    </div>

                    {/* Ver detalles */}
                    <button
                        onClick={() => onDetail(service)}
                        className="text-[10px] font-black text-sky-500 dark:text-[#8FC3A1] uppercase tracking-widest hover:text-sky-400 dark:hover:text-[#8FC3A1]/70 transition-colors flex items-center gap-1 group/btn bg-sky-500/10 dark:bg-[#8FC3A1]/10 px-3 py-1.5 rounded-lg"
                    >
                        Ver Detalles
                        <Icon name="ArrowRight" className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* ── Botón Publicar / Despublicar ── */}
                <div className="relative group/publish">
                    <button
                        onClick={(e) => { e.stopPropagation(); if (publishable || isPublished) onPublish(service); }}
                        disabled={!publishable && !isPublished}
                        className={`
                            w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
                            flex items-center justify-center gap-2 transition-all
                            ${isPublished
                                /* Publicado → botón para despublicar */
                                ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 border-sky-500/30 dark:border-[#8FC3A1]/30 text-sky-500 dark:text-[#8FC3A1] hover:bg-gray-500/10 dark:hover:bg-gray-300/10 hover:border-gray-500/30 dark:hover:border-gray-300/30 hover:text-gray-300 dark:hover:text-gray-300'
                                : publishable
                                /* Borrador + tiene especialista → puede publicar */
                                ? 'bg-gray-300/10 border-gray-300/30 text-gray-300 hover:bg-sky-500/10 dark:hover:bg-[#8FC3A1]/10 hover:border-sky-500/30 dark:hover:border-[#8FC3A1]/30 hover:text-sky-500 dark:hover:text-[#8FC3A1]'
                                /* Borrador sin especialista → deshabilitado */
                                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
                            }
                        `}
                    >
                        {isPublished ? (
                            <>
                                <Icon name="EyeOff" className="w-3.5 h-3.5" />
                                Despublicar servicio
                            </>
                        ) : (
                            <>
                                <Icon name="Eye" className="w-3.5 h-3.5" />
                                {publishable ? 'Publicar servicio' : 'Publicar (asigna un especialista)'}
                            </>
                        )}
                    </button>

                    {/* Tooltip cuando no se puede publicar */}
                    {!publishable && !isPublished && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl shadow-xl text-[10px] text-[var(--text-secondary)] text-center font-semibold opacity-0 group-hover/publish:opacity-100 transition-opacity pointer-events-none z-10">
                            Asigna al menos 1 especialista para poder publicar
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function Metric({ label, value }: { label: string; value: string; }) {
    return (
        <div className={``}>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70">{label}</p>
            <p className="text-[10px] font-black truncate">{value}</p>
        </div>
    );
}
