'use client';

import React from 'react';
import Image from 'next/image';
import {
  Service,
  Specialist,
  canPublish,
  ANTICIPACION_LABELS,
  serviceEtiquetasFromService,
} from '@/features/seller/services/types';
import Icon from '@/components/ui/Icon';

interface ServiceCardMobileProps {
  service: Service;
  specialists: Specialist[];
  isExpanded: boolean;
  onToggle: () => void;
  onDetail: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
  onPublish: (service: Service) => void;
}

function getAvatarChars(sp: Specialist): string {
  return (
    (sp.nombres?.charAt(0)?.toUpperCase() ?? '') +
    (sp.apellidos?.charAt(0)?.toUpperCase() ?? '')
  );
}

export default function ServiceCardMobile({
  service,
  specialists,
  isExpanded,
  onToggle,
  onDetail,
  onEdit,
  onDelete,
  onPublish,
}: ServiceCardMobileProps) {
  const isPublished = service.estado === 'publicado';
  const publishable = canPublish(service);

  const assignedSpecialists = service.especialistasAsignados
    .map((id) => specialists.find((e) => e.id === id))
    .filter((sp): sp is Specialist => !!sp);

  const MAX_AVATARS = 4;

  return (
    <div className="bg-[var(--bg-card)]">
      {/* Fila resumen — siempre visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-500 dark:bg-[#8FC3A1] flex items-center justify-center transition-transform duration-300"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <Icon name="ChevronDown" className="w-4 h-4 text-white dark:text-[#0a1a13]" />
        </span>

        <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden flex-shrink-0 relative">
          {service.imagen ? (
            <Image
              src={service.imagen}
              alt=""
              width={36}
              height={36}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
              <Icon name="Image" className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-[var(--text-primary)] truncate leading-tight">
            {service.denominacion}
          </p>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
            S/ {service.precio.toFixed(2)}
          </p>
        </div>

        <span
          className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[7px] font-black uppercase tracking-wider
            ${
              isPublished
                ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 text-sky-500 dark:text-[#8FC3A1] border-sky-500/20 dark:border-[#8FC3A1]/20'
                : 'bg-gray-500/15 dark:bg-gray-300/15 text-gray-500 dark:text-gray-300 border-gray-500/50 dark:border-gray-300/50'
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0
              ${isPublished ? 'bg-sky-500 dark:bg-[#8FC3A1] animate-pulse' : 'bg-gray-400 dark:bg-gray-300'}`}
          />
          {isPublished ? 'Pub.' : 'Borr.'}
        </span>
      </button>

      {/* Detalle expandido */}
      {isExpanded && (
        <div className="px-4 pb-4 pl-14 space-y-2.5 animate-fadeIn">
          {service.domicilio && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Domicilio</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-sky-500 dark:text-[#8FC3A1] uppercase tracking-wider">
                <Icon name="Home" className="w-3 h-3" /> Sí
              </span>
            </div>
          )}

          {ANTICIPACION_LABELS[service.anticipacionReserva] && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Anticipación</span>
              <span className="text-xs text-[var(--text-primary)] font-medium text-right">
                {ANTICIPACION_LABELS[service.anticipacionReserva]}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Categoría</span>
            <span className="text-xs text-[var(--text-primary)] font-medium text-right truncate max-w-[60%]">
              {service.categoria || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Equipo</span>
            {assignedSpecialists.length === 0 ? (
              <span className="text-[10px] text-[var(--text-secondary)] italic opacity-60">Sin asignar</span>
            ) : (
              <div className="flex -space-x-1.5 items-center">
                {assignedSpecialists.slice(0, MAX_AVATARS).map((esp) => (
                  <div
                    key={esp.id}
                    title={`${esp.nombres} ${esp.apellidos} · ${esp.especialidad}`}
                    className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] bg-sky-500/20 dark:bg-[#8FC3A1]/20 flex items-center justify-center text-[8px] font-black overflow-hidden relative"
                  >
                    {esp.foto ? (
                      <Image src={esp.foto} alt={`${esp.nombres} ${esp.apellidos}`} fill sizes="24px" className="object-cover" />
                    ) : (
                      <span className="text-sky-500 dark:text-[#8FC3A1]">{getAvatarChars(esp)}</span>
                    )}
                  </div>
                ))}
                {assignedSpecialists.length > MAX_AVATARS && (
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-secondary)] flex items-center justify-center text-[8px] font-bold text-[var(--text-secondary)]">
                    +{assignedSpecialists.length - MAX_AVATARS}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Acciones</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDetail(service)}
                title="Ver detalles"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
              >
                <Icon name="ArrowRight" className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit(service)}
                title="Editar"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
              >
                <Icon name="Pencil" className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { if (publishable || isPublished) onPublish(service); }}
                disabled={!publishable && !isPublished}
                title={isPublished ? 'Despublicar' : publishable ? 'Publicar' : 'Asigna un especialista para publicar'}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                  ${
                    isPublished
                      ? 'text-sky-500 dark:text-[#8FC3A1] hover:bg-red-500/10 hover:text-red-400 dark:hover:text-red-400'
                      : publishable
                        ? 'text-gray-400 hover:bg-sky-500/10 hover:text-sky-500 dark:hover:text-[#8FC3A1]'
                        : 'text-[var(--text-secondary)] opacity-25 cursor-not-allowed'
                  }`}
              >
                <Icon name={isPublished ? 'EyeOff' : 'Eye'} className="w-3.5 h-3.5 stroke-2" />
              </button>
              <button
                onClick={() => onDelete(service.id)}
                title="Eliminar"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <Icon name="Trash2" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}