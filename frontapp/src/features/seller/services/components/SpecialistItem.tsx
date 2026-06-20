'use client';

import React from 'react';
import Image from 'next/image';
import { Specialist } from '@/features/seller/services/types';
import Icon from '@/components/ui/Icon';
import { useTheme } from 'next-themes';

interface SpecialistItemProps {
    specialist: Specialist;
    onClick: (specialist: Specialist) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calcula las iniciales desde nombres + apellidos */
function getAvatarChars(specialist: Specialist): string {
  const first = specialist.nombres?.charAt(0)?.toUpperCase() ?? '';
  const last = specialist.apellidos?.charAt(0)?.toUpperCase() ?? '';
  return `${first}${last}`;
}

/** Genera un color determinista a partir del id del especialista */
const AVATAR_PALETTE = [
  '#38bdf8',
  '#38bdf8',
  '#38bdf8',
  '#38bdf8',
  '#38bdf8',
  '#38bdf8',
  '#38bdf8',
  '#38bdf8',
];

function getAvatarColor(id: number): string {
    return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SpecialistItem({
  specialist,
  onClick,
}: SpecialistItemProps) {
  const avatarChars = getAvatarChars(specialist);
  const avatarColor = getAvatarColor(specialist.id);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const avatarBg = isDark ? '#8FC3A1' : avatarColor;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(specialist)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(specialist);
      }}
      className="glass-card bg-[var(--bg-card)] p-4 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 dark:hover:shadow-[#8FC3A1]/10 transition-all cursor-pointer group animate-slideInRight rounded-2xl border border-[var(--border-subtle)]"
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white overflow-hidden transition-transform group-hover:scale-105 shadow-md relative flex-shrink-0"
        style={{ backgroundColor: avatarBg }}
      >
        {specialist.foto ? (
          <Image
            src={specialist.foto}
            alt={`${specialist.nombres} ${specialist.apellidos}`}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <span>{avatarChars}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black text-[var(--text-primary)] truncate tracking-tight">
          {specialist.nombres} {specialist.apellidos}
        </h4>
        <p className="text-[10px] font-bold text-[var(--text-secondary)] flex items-center gap-1 uppercase truncate tracking-widest mt-0.5">
          <Icon
            name="Stethoscope"
            className="w-3 h-3 text-sky-400 dark:text-[#8FC3A1]"
          />
          {specialist.especialidad}
        </p>

        {/* Badge de disponibilidad */}
        <span
          className={`inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                    ${
                      specialist.availability === 'Disponible'
                        ? 'bg-sky-600/10 dark:bg-emerald-500/10 text-sky-600 dark:text-emerald-500'
                        : specialist.availability === 'Ocupado'
                          ? 'bg-sky-400/10 dark:bg-[#8FC3A1]/10 text-sky-400 dark:text-[#8FC3A1]'
                          : 'bg-gray-500/10 dark:bg-gray-300/10 text-gray-500 dark:text-gray-300'
                    }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full
                        ${
                          specialist.availability === 'Disponible'
                            ? 'bg-sky-600 dark:bg-emerald-500 animate-pulse'
                            : specialist.availability === 'Ocupado'
                              ? 'bg-sky-400 dark:bg-[#8FC3A1]'
                              : 'bg-gray-500 dark:bg-gray-300'
                        }`}
          />
          {specialist.availability}
        </span>
      </div>

            {/* Chevron */}
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-sky-500/10 dark:group-hover:bg-[#8FC3A1]/10 group-hover:text-sky-500 dark:group-hover:text-[#8FC3A1] transition-colors flex-shrink-0">
                <Icon name="ChevronRight" className="w-4 h-4" />
            </div>
        </div>
    );
}
