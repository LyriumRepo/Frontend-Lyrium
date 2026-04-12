import React from 'react';
import Image from 'next/image';
import { Specialist } from '@/features/seller/services/types';
import Icon from '@/components/ui/Icon';

interface SpecialistItemProps {
    specialist: Specialist;
    onClick: (specialist: Specialist) => void;
}

export default function SpecialistItem({ specialist, onClick }: SpecialistItemProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(specialist)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(specialist); }}
            className="glass-card bg-[var(--bg-card)] p-4 flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 transition-all cursor-pointer group animate-slideInRight rounded-2xl border border-[var(--border-subtle)]"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white overflow-hidden transition-transform group-hover:scale-105 shadow-md`} style={{ backgroundColor: specialist.color || '#38bdf8' }}>
                {specialist.foto ? (
                    <Image src={specialist.foto} alt={specialist.nombres} fill sizes="48px" className="object-cover" />
                ) : (
                    specialist.avatar_chars
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-[var(--text-primary)] truncate tracking-tight">{specialist.nombres} {specialist.apellidos}</h4>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] flex items-center gap-1 uppercase truncate tracking-widest mt-0.5">
                    <Icon name="Stethoscope" className="w-3 h-3 text-sky-400" /> {specialist.especialidad}
                </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-sky-500/10 group-hover:text-sky-500 transition-colors">
                <Icon name="ChevronRight" className="w-4 h-4" />
            </div>
        </div>
    );
}
