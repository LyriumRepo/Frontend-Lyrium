import React from 'react';
import Image from 'next/image';
import { Service, Specialist, Appointment } from '@/features/seller/services/types';
import BaseDrawer from '@/components/ui/BaseDrawer';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';

interface ServiceDetailModalProps {
    service: Service | null;
    specialists: Specialist[];
    appointments: Appointment[];
    isOpen: boolean;
    onClose: () => void;
    onEdit: (service: Service) => void;
    onReschedule: (appointment: Appointment) => void;
}

export default function ServiceDetailModal({ service, specialists, appointments, isOpen, onClose, onEdit, onReschedule }: ServiceDetailModalProps) {
    if (!service) return null;

    const assignedSpecialists = specialists.filter(s => service.especialistas_ids.includes(s.id));
    const serviceAppointments = appointments.filter(a => a.servicio === service.nombre);

    const footer = (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <BaseButton
                variant="ghost"
                onClick={onClose}
                className="flex-1 !rounded-3xl"
            >
                Cerrar Panel
            </BaseButton>
            <BaseButton
                onClick={() => {
                    onEdit(service);
                    onClose();
                }}
                variant="primary"
                leftIcon="Pencil"
                className="flex-[2] !rounded-3xl"
                size="md"
            >
                Editar Configuración
            </BaseButton>
        </div>
    );

    return (
        <BaseDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={service.nombre}
            subtitle={service.horario}
            badge="Auditoría de Servicio"
            width="md:w-[650px]"
            accentColor="from-sky-500/10 via-indigo-500/5"
            footer={footer}
        >
            <div className="space-y-12">
                {/* Status & Specialists Quick Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Estado Operativo</p>
                        <div className={`flex items-center gap-5 p-6 rounded-[2.5rem] border shadow-sm transition-all
                            ${service.estado === 'disponible'
                                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10'
                                : 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/10'}`}>
                            <div className="relative">
                                <div className={`w-4 h-4 rounded-full ${service.estado === 'disponible' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                {service.estado === 'disponible' && <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-75"></div>}
                            </div>
                            <div>
                                <p className={`text-sm font-black tracking-tight ${service.estado === 'disponible' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {service.estado === 'disponible' ? 'Activo en Tienda' : 'Fuera de Línea'}
                                </p>
                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter mt-0.5">Visibilidad Pública OK</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Staff Certificado</p>
                        <div className="flex -space-x-3 p-4 bg-[var(--bg-secondary)]/30 rounded-[2.5rem] border border-[var(--border-subtle)] min-h-[5.5rem] items-center px-8 shadow-inner">
                            {assignedSpecialists.map(esp => (
                                <div
                                    key={esp.id}
                                    className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border-[3px] border-[var(--bg-card)] flex items-center justify-center text-sm font-black overflow-hidden shadow-lg hover:-translate-y-2 hover:z-10 transition-all cursor-pointer ring-1 ring-[var(--border-subtle)]"
                                    title={`${esp.nombres}`}
                                >
                                    {esp.foto ? <Image src={esp.foto} fill sizes="48px" className="object-cover" alt="" /> : <span className="text-sky-500">{esp.avatar_chars}</span>}
                                </div>
                            ))}
                            {assignedSpecialists.length === 0 && (
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] italic">Sin asignar</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timeline Appointments */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-sky-500 rounded-full"></div>
                            Hoja de Ruta (Hoy)
                        </h3>
                        <span className="text-[9px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full">{serviceAppointments.length} Citas</span>
                    </div>

                    <div className="space-y-4">
                        {serviceAppointments.length > 0 ? (
                            serviceAppointments.map((appointment, idx) => {
                                const esp = specialists.find(e => e.id === appointment.especialistaId);
                                return (
                                    <div key={appointment.id} className="relative pl-8 group">
                                        {/* Timeline Line */}
                                        {idx !== serviceAppointments.length - 1 && (
                                            <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gradient-to-b from-[var(--border-subtle)] to-transparent"></div>
                                        )}
                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 top-6 w-6 h-6 bg-[var(--bg-card)] border-2 border-sky-400 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-125 transition-transform">
                                            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></div>
                                        </div>

                                        <div className="p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-all hover:shadow-2xl hover:shadow-black/5 hover:border-sky-500/20">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-xs font-black text-sky-500 border border-sky-500/20">
                                                    {esp?.avatar_chars || '??'}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-[var(--text-primary)] tracking-tight leading-tight">{appointment.cliente}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-[11px] font-black text-sky-500 font-mono bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 uppercase">{appointment.hora}</span>
                                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">• {esp?.nombres || 'Personal'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                                                <button
                                                    onClick={() => onReschedule(appointment)}
                                                    className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/10 hover:text-sky-500 transition-all active:scale-95 border border-transparent hover:border-sky-500/20"
                                                >
                                                    Reprogramar
                                                </button>
                                                <div className="px-5 py-3 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                                                    Confirmada
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-[var(--bg-secondary)]/30 rounded-[3rem] border-2 border-dashed border-[var(--border-subtle)]">
                                <div className="w-16 h-16 bg-[var(--bg-card)] rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/5 border border-[var(--border-subtle)]">
                                    <Icon name="CalendarX" className="w-8 h-8 text-[var(--text-secondary)]" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Sin Actividad Programada</p>
                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase italic">Tu agenda está despejada por ahora</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Technical Meta (Horarios, etc) */}
                <div className="p-8 bg-sky-500 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -z-0"></div>
                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex items-center gap-3">
                            <Icon name="ShieldCheck" className="text-sky-400 w-6 h-6" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Configuración Maestra</h4>
                        </div>
                        <div className="text-[10px] font-black text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">AUTO-MANAGED</div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Rango de Atención</p>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    <Icon name="Clock" className="text-sky-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black tracking-tight">{service.horario.split('•')[1] || 'Sin Horario'}</p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase mt-0.5">Ventana Operativa</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Carga de Citas</p>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    <Icon name="TrendingUp" className="text-emerald-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black tracking-tight">{service.config?.max_citas || 1} <span className="text-[10px] font-bold opacity-30">PX/SLOT</span></p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase mt-0.5">Promedio Concurrencia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseDrawer>
    );
}
