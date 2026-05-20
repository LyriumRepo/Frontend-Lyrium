import React from 'react';
import Image from 'next/image';
import {
    Service,
    Specialist,
    Appointment,
    WEEK_DAY_SHORT,
    countTotalSessions,
} from '@/features/seller/services/types';
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAvatarChars(sp: Specialist): string {
    return (
        (sp.nombres?.charAt(0)?.toUpperCase() ?? '') +
        (sp.apellidos?.charAt(0)?.toUpperCase() ?? '')
    );
}

/** "Lun, Mié, Vie · 12 sesiones · 30 min" */
function buildScheduleSubtitle(service: Service): string {
    if (!service.diasAtencion || service.diasAtencion.length === 0) return 'Sin horario configurado';
    const days = service.diasAtencion.map((d) => WEEK_DAY_SHORT[d.dia]).join(', ');
    const total = countTotalSessions(service.diasAtencion, service.duracion);
    const dur = service.duracion < 60
        ? `${service.duracion} min`
        : `${service.duracion / 60}h`;
    return `${days}  ·  ${total} sesión${total !== 1 ? 'es' : ''}  ·  ${dur} c/u`;
}

/** Servicio considerado activo si tiene días + al menos un especialista asignado */
function isServiceActive(service: Service): boolean {
    return service.diasAtencion.length > 0 && service.especialistasAsignados.length > 0;
}

const ESTADO_COLORS: Record<Appointment['estado'], string> = {
    confirmada: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    pendiente:  'bg-amber-500/10  text-amber-500  border-amber-500/20',
    cancelada:  'bg-rose-500/10   text-rose-500   border-rose-500/20',
};

const ESTADO_LABELS: Record<Appointment['estado'], string> = {
    confirmada: 'Confirmada',
    pendiente:  'Pendiente',
    cancelada:  'Cancelada',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServiceDetailModal({
    service,
    specialists,
    appointments,
    isOpen,
    onClose,
    onEdit,
    onReschedule,
}: ServiceDetailModalProps) {
    if (!service) return null;

    // Especialistas asignados resueltos
    const assignedSpecialists = service.especialistasAsignados
        .map((id) => specialists.find((s) => s.id === id))
        .filter((s): s is Specialist => !!s);

    // Citas de este servicio
    const serviceAppointments = appointments.filter((a) => a.serviceId === service.id);

    const active = isServiceActive(service);
    const scheduleSubtitle = buildScheduleSubtitle(service);
    const totalSessions = countTotalSessions(service.diasAtencion, service.duracion);

    const footer = (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <BaseButton variant="ghost" onClick={onClose} className="flex-1 !rounded-3xl">
                Cerrar Panel
            </BaseButton>
            <BaseButton
                onClick={() => { onEdit(service); onClose(); }}
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
            title={service.denominacion}
            subtitle={scheduleSubtitle}
            badge="Auditoría de Servicio"
            width="md:w-[650px]"
            accentColor="from-sky-500/10 via-indigo-500/5"
            footer={footer}
        >
            <div className="space-y-12">

                {/* ── Estado operativo + Staff ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Estado derivado */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                            Estado Operativo
                        </p>
                        <div className={`flex items-center gap-5 p-6 rounded-[2.5rem] border shadow-sm transition-all
                            ${active
                                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10'
                                : 'bg-rose-500/10   border-rose-500/20   shadow-rose-500/10'
                            }`}>
                            <div className="relative flex-shrink-0">
                                <div className={`w-4 h-4 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {active && (
                                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-black tracking-tight ${active ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {active ? 'Activo en Tienda' : 'Configuración Incompleta'}
                                </p>
                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter mt-0.5">
                                    {active ? 'Visibilidad pública OK' : 'Asigna días o especialistas'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Staff */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                            Staff Certificado
                        </p>
                        <div className="flex -space-x-3 p-4 bg-[var(--bg-secondary)]/30 rounded-[2.5rem] border border-[var(--border-subtle)] min-h-[5.5rem] items-center px-8 shadow-inner">
                            {assignedSpecialists.length === 0 ? (
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] italic">Sin asignar</p>
                            ) : (
                                assignedSpecialists.map((esp) => (
                                    <div
                                        key={esp.id}
                                        className="relative w-12 h-12 rounded-2xl bg-[var(--bg-card)] border-[3px] border-[var(--bg-card)] flex items-center justify-center text-sm font-black overflow-hidden shadow-lg hover:-translate-y-2 hover:z-10 transition-all cursor-pointer ring-1 ring-[var(--border-subtle)]"
                                        title={`${esp.nombres} ${esp.apellidos} · ${esp.especialidad}`}
                                    >
                                        {esp.foto
                                            ? <Image src={esp.foto} fill sizes="48px" className="object-cover" alt={`${esp.nombres} ${esp.apellidos}`} />
                                            : <span className="text-sky-500">{getAvatarChars(esp)}</span>
                                        }
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Citas del servicio ── */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-sky-500 rounded-full" />
                            Hoja de Ruta (Hoy)
                        </h3>
                        <span className="text-[9px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                            {serviceAppointments.length} Cita{serviceAppointments.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {serviceAppointments.length > 0 ? (
                            serviceAppointments.map((appointment, idx) => {
                                const esp = specialists.find((e) => e.id === appointment.specialistId);
                                return (
                                    <div key={appointment.id} className="relative pl-8 group">
                                        {/* Línea del timeline */}
                                        {idx !== serviceAppointments.length - 1 && (
                                            <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gradient-to-b from-[var(--border-subtle)] to-transparent" />
                                        )}
                                        {/* Punto del timeline */}
                                        <div className="absolute left-0 top-6 w-6 h-6 bg-[var(--bg-card)] border-2 border-sky-400 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-125 transition-transform">
                                            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                                        </div>

                                        <div className="p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-all hover:shadow-2xl hover:shadow-black/5 hover:border-sky-500/20">
                                            <div className="flex items-center gap-5">
                                                {/* Avatar especialista */}
                                                <div className="relative w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-xs font-black text-sky-500 border border-sky-500/20 overflow-hidden flex-shrink-0">
                                                    {esp?.foto
                                                        ? <Image src={esp.foto} fill sizes="48px" className="object-cover" alt="" />
                                                        : <span>{esp ? getAvatarChars(esp) : '??'}</span>
                                                    }
                                                </div>
                                                <div>
                                                    {/* Fecha + sesión */}
                                                    <p className="text-base font-black text-[var(--text-primary)] tracking-tight leading-tight">
                                                        {appointment.fecha}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                        <span className="text-[11px] font-black text-sky-500 font-mono bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 uppercase">
                                                            {appointment.sesion.inicio} – {appointment.sesion.fin}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                                            · {esp ? `${esp.nombres} ${esp.apellidos}` : 'Personal no asignado'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                                            · {appointment.cuposOcupados} cupo{appointment.cuposOcupados !== 1 ? 's' : ''}
                                                        </span>
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
                                                <div className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${ESTADO_COLORS[appointment.estado]}`}>
                                                    {ESTADO_LABELS[appointment.estado]}
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
                                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">
                                        Sin Actividad Programada
                                    </p>
                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase italic">
                                        Tu agenda está despejada por ahora
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Configuración maestra ── */}
                <div className="p-8 bg-sky-500 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -z-0" />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex items-center gap-3">
                            <Icon name="ShieldCheck" className="text-sky-200 w-6 h-6" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                                Configuración Maestra
                            </h4>
                        </div>
                        <div className="text-[10px] font-black text-sky-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                            AUTO-MANAGED
                        </div>
                    </div>

                    {/* Grid de métricas */}
                    <div className="grid grid-cols-2 gap-8 relative z-10">

                        {/* Días de atención */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                                Días de Atención
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    <Icon name="Clock" className="text-sky-200 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black tracking-tight">
                                        {service.diasAtencion.length > 0
                                            ? service.diasAtencion.map((d) => WEEK_DAY_SHORT[d.dia]).join(', ')
                                            : '—'
                                        }
                                    </p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase mt-0.5">
                                        Ventana Operativa
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cupos y sesiones */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                                Capacidad
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    <Icon name="TrendingUp" className="text-emerald-300 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black tracking-tight">
                                        {service.cupos}
                                        <span className="text-[10px] font-bold opacity-30 ml-1">PX/SESIÓN</span>
                                    </p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase mt-0.5">
                                        {totalSessions} sesiones en total
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Duración */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                                Duración por Sesión
                            </p>
                            <p className="text-xl font-black tracking-tight">
                                {service.duracion < 60
                                    ? `${service.duracion} min`
                                    : `${service.duracion / 60}h`
                                }
                            </p>
                        </div>

                        {/* Precio */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                                Precio por Sesión
                            </p>
                            <p className="text-xl font-black tracking-tight">
                                S/. {service.precio.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </BaseDrawer>
    );
}