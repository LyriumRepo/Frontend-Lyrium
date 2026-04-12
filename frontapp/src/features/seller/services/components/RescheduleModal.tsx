'use client';

import React, { useState } from 'react';
import { Appointment } from '@/features/seller/services/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';

interface RescheduleModalProps {
    appointment: Appointment | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: number, newTime: string) => void;
}

import Icon from '@/components/ui/Icon';

export default function RescheduleModal({ appointment, isOpen, onClose, onConfirm }: RescheduleModalProps) {
    const [newTime, setNewTime] = useState(appointment?.hora || '08:00');

    // Simplification: assume no conflict detect logic available
    const hasConflict = false;

    if (!appointment) return null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Ajuste de Itinerario"
            subtitle="Reprogramación de Cita Operativa"
            size="md"
            accentColor="from-sky-400 to-indigo-500"
        >
            <div className="p-8 space-y-8">
                <div className="bg-[var(--bg-secondary)]/50 p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-inner space-y-6">
                    <div className="flex flex-col items-center text-center gap-2 mb-4">
                        <div className="w-16 h-16 bg-[var(--bg-card)] rounded-3xl flex items-center justify-center text-[var(--brand-sky)] shadow-xl shadow-[var(--border-subtle)]/50 border border-[var(--border-subtle)] mb-2">
                            <Icon name="CalendarClock" className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none">Cliente</p>
                        <h4 className="text-xl font-black text-[var(--text-primary)] tracking-tight">{appointment.cliente}</h4>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="reschedule-time" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 block text-center">Nueva Marca Horaria</label>
                        <div className="relative group">
                            <Icon name="Clock" className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--brand-sky)] w-5 h-5 z-10 transition-transform group-hover:scale-110" />
                            <input
                                id="reschedule-time"
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className={`w-full pl-16 pr-8 py-5 bg-[var(--bg-card)] rounded-[2rem] border-2 font-black text-[var(--text-primary)] shadow-xl transition-all font-mono text-xl outline-none text-center
                                    ${hasConflict ? 'border-[var(--text-danger)] ring-4 ring-[var(--text-danger)]/10' : 'border-[var(--border-subtle)] focus:border-[var(--brand-sky)]/30'}`}
                            />
                        </div>
                    </div>

                    {hasConflict && (
                        <div className="p-5 bg-[var(--bg-danger)] border border-[var(--text-danger)]/20 rounded-[2rem] animate-shake">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--text-danger)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--text-danger)]/20">
                                    <Icon name="AlertCircle" className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-[var(--text-danger)] uppercase tracking-widest">Conflicto de Agenda</p>
                                    <p className="text-[9px] font-bold text-[var(--text-danger)]/70 leading-tight mt-0.5">La franja horaria seleccionada ya cuenta con una operación activa.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <BaseButton
                        onClick={() => {
                            onConfirm(appointment.id, newTime);
                            onClose();
                        }}
                        disabled={hasConflict}
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="CheckCircle2"
                    >
                        Confirmar Cambio
                    </BaseButton>
                    <BaseButton
                        onClick={onClose}
                        variant="ghost"
                        size="lg"
                        fullWidth
                    >
                        Descartar Operación
                    </BaseButton>
                </div>
            </div>
        </BaseModal>
    );
}
