'use client';

import { X, Download, CheckCircle2, XCircle } from 'lucide-react';
import type { Solicitud } from '../hooks/useSellers';

interface SunatDataModalProps {
    solicitud: Solicitud;
    onClose: () => void;
}

function BooleanoBadge({ valor }: { valor: boolean }) {
    return valor ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> SÍ
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> NO
        </span>
    );
}

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">{label}</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{value ?? '—'}</span>
        </div>
    );
}

export function SunatDataModal({ solicitud, onClose }: SunatDataModalProps) {
    const sunat = solicitud.sunatData;

    const validacion = sunat?.validacion ?? {
        rucExiste: false,
        estadoActivo: false,
        condicionHabido: false,
        emiteComprobante: false,
    };

    const handleExportar = () => {
        const payload = {
            solicitud_id: solicitud.id,
            ruc: solicitud.ruc,
            nombre_comercial: solicitud.nombreComercial,
            datos_extraidos_sunat: {
                razonSocial: sunat?.razonSocial ?? null,
                nombreComercial: sunat?.nombreComercial ?? null,
                fechaInicio: sunat?.fechaInicio ?? null,
                actividad: sunat?.actividad ?? null,
                estado: sunat?.estado ?? null,
                condicion: sunat?.condicion ?? null,
                comprobantes: sunat?.comprobantes ?? [],
                representantes: sunat?.representantes ?? [],
            },
            validacion_datos_criticos: validacion,
            exportado_en: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sunat_${solicitud.ruc}_${solicitud.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-card)] z-10">
                    <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                            Datos SUNAT — {solicitud.nombreComercial}
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide mt-0.5">
                            RUC {solicitud.ruc}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* 1. Datos extraídos */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-sky-500/10 dark:bg-[var(--icons-green)]/15 text-sky-400 dark:text-[var(--icons-green)] flex items-center justify-center text-[10px] font-black">1</span>
                            Datos extraídos por el RPA desde SUNAT
                        </h4>
                        <div className="grid grid-cols-2 gap-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
                            <Campo label="Razón Social" value={sunat?.razonSocial} />
                            <Campo label="Nombre Comercial" value={sunat?.nombreComercial} />
                            <Campo label="Fecha de Inicio de Actividades" value={sunat?.fechaInicio} />
                            <Campo label="Actividad Económica" value={sunat?.actividad} />
                            <Campo label="Estado del Contribuyente" value={sunat?.estado} />
                            <Campo label="Condición del Domicilio" value={sunat?.condicion} />
                            <div className="col-span-2">
                                <Campo
                                    label="Comprobantes que puede emitir"
                                    value={
                                        Array.isArray(sunat?.comprobantes) && sunat.comprobantes.length > 0
                                            ? sunat.comprobantes.join(' · ')
                                            : 'No registra comprobantes electrónicos'
                                    }
                                />
                            </div>
                        </div>

                        {/* Tabla de representantes */}
                        {Array.isArray(sunat?.representantes) && sunat.representantes.length > 0 && (
                            <div className="mt-4">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] block mb-2">
                                    Representante(s) Legal(es)
                                </span>
                                <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
                                                <th className="px-3 py-2 text-left font-black uppercase tracking-wide text-[var(--text-secondary)] text-[10px]">Documento</th>
                                                <th className="px-3 py-2 text-left font-black uppercase tracking-wide text-[var(--text-secondary)] text-[10px]">Nro.</th>
                                                <th className="px-3 py-2 text-left font-black uppercase tracking-wide text-[var(--text-secondary)] text-[10px]">Nombre</th>
                                                <th className="px-3 py-2 text-left font-black uppercase tracking-wide text-[var(--text-secondary)] text-[10px]">Cargo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sunat.representantes.map((r: any, i: number) => (
                                                <tr
                                                    key={i}
                                                    className={`border-b border-[var(--border-subtle)] last:border-0 ${
                                                        i % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-card)]'
                                                    }`}
                                                >
                                                    <td className="px-3 py-2 font-semibold text-[var(--text-primary)]">{r.tipoDocumento || '—'}</td>
                                                    <td className="px-3 py-2 font-mono text-[var(--text-primary)]">{r.nroDocumento || r.dni || '—'}</td>
                                                    <td className="px-3 py-2 text-[var(--text-primary)]">{r.nombre || '—'}</td>
                                                    <td className="px-3 py-2 text-[var(--text-secondary)] capitalize">{r.cargo || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Validación de datos críticos */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-sky-500/10 dark:bg-[var(--icons-green)]/15 text-sky-400 dark:text-[var(--icons-green)] flex items-center justify-center text-[10px] font-black">2</span>
                            Validación de datos críticos
                        </h4>
                        <div className="grid grid-cols-2 gap-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-4">
                            <div className="flex items-center justify-between gap-2 bg-[var(--bg-card)] rounded-lg px-3 py-2.5 border border-[var(--border-subtle)]">
                                <span className="text-xs font-semibold text-[var(--text-primary)]">¿El RUC existe?</span>
                                <BooleanoBadge valor={validacion.rucExiste} />
                            </div>
                            <div className="flex items-center justify-between gap-2 bg-[var(--bg-card)] rounded-lg px-3 py-2.5 border border-[var(--border-subtle)]">
                                <span className="text-xs font-semibold text-[var(--text-primary)]">¿Estado = ACTIVO?</span>
                                <BooleanoBadge valor={validacion.estadoActivo} />
                            </div>
                            <div className="flex items-center justify-between gap-2 bg-[var(--bg-card)] rounded-lg px-3 py-2.5 border border-[var(--border-subtle)]">
                                <span className="text-xs font-semibold text-[var(--text-primary)]">¿Condición = HABIDO?</span>
                                <BooleanoBadge valor={validacion.condicionHabido} />
                            </div>
                            <div className="flex items-center justify-between gap-2 bg-[var(--bg-card)] rounded-lg px-3 py-2.5 border border-[var(--border-subtle)]">
                                <span className="text-xs font-semibold text-[var(--text-primary)]">¿Emite comprobantes?</span>
                                <BooleanoBadge valor={validacion.emiteComprobante} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border-subtle)] sticky bottom-0 bg-[var(--bg-card)]">
                    <button
                        onClick={handleExportar}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 dark:bg-[var(--icons-green)]/15 text-sky-400 dark:text-[var(--icons-green)] border border-sky-500/20 dark:border-[var(--icons-green)]/20 text-xs font-bold uppercase tracking-wide hover:bg-sky-500/20 dark:hover:bg-[var(--icons-green)]/25 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar JSON
                    </button>
                </div>
            </div>
        </div>
    );
}