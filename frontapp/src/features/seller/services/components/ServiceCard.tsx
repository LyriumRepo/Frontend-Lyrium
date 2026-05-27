'use client';

import React from 'react';
import Image from 'next/image';
import {
    Service,
    Specialist,
    canPublish,
    ANTICIPACION_LABELS,
} from '@/features/seller/services/types';
import Icon from '@/components/ui/Icon';

interface ServiceCardProps {
    service:    Service;
    specialists: Specialist[];
    onDetail:   (service: Service) => void;
    onEdit:     (service: Service) => void;
    onDelete:   (id: number) => void;
    onPublish:  (service: Service) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarChars(sp: Specialist): string {
    return (
        (sp.nombres?.charAt(0)?.toUpperCase() ?? '') +
        (sp.apellidos?.charAt(0)?.toUpperCase() ?? '')
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
// Renders as a <tr> — must be placed inside a <tbody>.

export default function ServiceCard({
    service,
    specialists,
    onDetail,
    onEdit,
    onDelete,
    onPublish,
}: ServiceCardProps) {
    const isPublished       = service.estado === 'publicado';
    const publishable       = canPublish(service);

    const assignedSpecialists = service.especialistasAsignados
        .map((id) => specialists.find((e) => e.id === id))
        .filter((sp): sp is Specialist => !!sp);

    const MAX_AVATARS = 3;

    return (
        <tr className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-secondary)]/60 transition-colors group">

            {/* ── Estado ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider
                        ${isPublished
                            ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] border-sky-500/20 dark:border-[#8FC3A1]/20'
                            : 'bg-gray-500/15 dark:bg-gray-300/15 text-gray-500 dark:text-gray-300 border-gray-500/50 dark:border-gray-300/50'
                        }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                            ${isPublished
                                ? 'bg-sky-500 dark:bg-[#8FC3A1] animate-pulse'
                                : 'bg-gray-400 dark:bg-gray-300'
                            }`}
                    />
                    {isPublished ? 'Publicado' : 'Borrador'}
                </span>
            </td>

            {/* ── Servicio ── */}
            <td className="px-4 py-3 w-[240px] max-w-[240px]">
                {/* Tooltip en el nombre */}
                <div className="relative group/name">
                    <p className="text-sm font-black text-[var(--text-primary)] truncate leading-tight cursor-default">
                        {service.denominacion}
                    </p>
                    <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover/name:block">
                        {service.denominacion}
                        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {service.domicilio && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-sky-500 dark:text-[#8FC3A1] uppercase tracking-wider">
                            <Icon name="Home" className="w-2.5 h-2.5" />
                            Domicilio
                        </span>
                    )}
                    <span className="text-[10px] text-[var(--text-secondary)] font-bold truncate">
                        {ANTICIPACION_LABELS[service.anticipacionReserva]
                            ? `Anticipación: ${ANTICIPACION_LABELS[service.anticipacionReserva]}`
                            : ''}
                    </span>
                </div>
            </td>

            {/* ── Categoría ── */}
            <td className="px-4 py-3 w-[240px] max-w-[240px]">
                {service.categoria ? (
                    <div className="relative group/cat">
                        <span className="block truncate text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide cursor-default">
                            {service.categoria}
                        </span>
                        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover/cat:block">
                            {service.categoria}
                            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                        </div>
                    </div>
                ) : (
                    <span className="text-[var(--text-secondary)] opacity-30 text-sm">—</span>
                )}
            </td>

            {/* ── Precio ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm font-black text-[var(--text-primary)]">
                    S/ {service.precio.toFixed(2)}
                </span>
            </td>

            {/* ── Equipo ── */}
            <td className="px-4 py-3">
                {assignedSpecialists.length === 0 ? (
                    <span className="text-[9px] text-[var(--text-secondary)] italic opacity-50">
                        Sin asignar
                    </span>
                ) : (
                    <div className="flex -space-x-1.5 items-center">
                        {assignedSpecialists.slice(0, MAX_AVATARS).map((esp) => (
                            <div
                                key={esp.id}
                                title={`${esp.nombres} ${esp.apellidos} · ${esp.especialidad}`}
                                className="w-7 h-7 rounded-full border-2 border-[var(--bg-card)] bg-sky-500/20 dark:bg-[#8FC3A1]/20 flex items-center justify-center text-[9px] font-black overflow-hidden relative hover:scale-110 hover:z-10 transition-transform cursor-default"
                            >
                                {esp.foto ? (
                                    <Image
                                        src={esp.foto}
                                        alt={`${esp.nombres} ${esp.apellidos}`}
                                        fill
                                        sizes="28px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-sky-500 dark:text-[#8FC3A1]">
                                        {getAvatarChars(esp)}
                                    </span>
                                )}
                            </div>
                        ))}
                        {assignedSpecialists.length > MAX_AVATARS && (
                            <div className="w-7 h-7 rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-secondary)] flex items-center justify-center text-[9px] font-bold text-[var(--text-secondary)]">
                                +{assignedSpecialists.length - MAX_AVATARS}
                            </div>
                        )}
                    </div>
                )}
            </td>

            {/* ── Acciones ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-0.5">

                    {/* Ver detalles */}
                    <button
                        onClick={() => onDetail(service)}
                        title="Ver detalles"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
                    >
                        <Icon name="ArrowRight" className="w-3.5 h-3.5" />
                    </button>

                    {/* Editar */}
                    <button
                        onClick={() => onEdit(service)}
                        title="Editar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
                    >
                        <Icon name="Pencil" className="w-3.5 h-3.5" />
                    </button>

                    {/* Publicar / Despublicar */}
                    <button
                        onClick={() => { if (publishable || isPublished) onPublish(service); }}
                        disabled={!publishable && !isPublished}
                        title={
                            isPublished
                                ? 'Despublicar'
                                : publishable
                                ? 'Publicar'
                                : 'Asigna un especialista para publicar'
                        }
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                            ${isPublished
                                ? 'text-sky-500 dark:text-[#8FC3A1] hover:bg-red-500/10 hover:text-red-400 dark:hover:text-red-400'
                                : publishable
                                ? 'text-gray-400 hover:bg-sky-500/10 hover:text-sky-500 dark:hover:text-[#8FC3A1]'
                                : 'text-[var(--text-secondary)] opacity-25 cursor-not-allowed'
                            }`}
                    >
                        <Icon name={isPublished ? 'EyeOff' : 'Eye'} className="w-3.5 h-3.5 stroke-2" />
                    </button>

                    {/* Eliminar */}
                    <button
                        onClick={() => onDelete(service.id)}
                        title="Eliminar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <Icon name="Trash2" className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}