'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

export default function RegisteredStoreInfo() {
    const info = {
        razon_social: "Vida Natural Perú S.A.C.",
        nombre_comercial: "Vida Natural",
        admin_name: "Ricardo Arona Valdivia",
        admin_email: "admin@vidanatural.pe"
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn pb-12">
            {/* Identity Card */}
            <div className="glass-card p-10 border-t-4 border-sky-500/50">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 shadow-sm">
                        <Icon name="Building2" className="text-2xl font-bold w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Identidad Registrada</h2>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">RF-21: Consulta Operativa</p>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Razón Social</span>
                        <p className="text-sm font-black text-[var(--text-primary)] px-5 py-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)]/50 shadow-sm">{info.razon_social}</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombre Comercial</span>
                        <p className="text-sm font-black text-[var(--text-primary)] px-5 py-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)]/50 shadow-sm">{info.nombre_comercial}</p>
                    </div>
                </div>
            </div>

            {/* Admin Card */}
            <div className="glass-card p-10 border-t-4 border-indigo-500/50">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                        <Icon name="IdCard" className="text-2xl font-bold w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Administración Enlazada</h2>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">RF-22: Gestión de Cuenta</p>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Representante Administrativo</span>
                        <p className="text-sm font-black text-[var(--text-primary)] px-5 py-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)]/50 shadow-sm">{info.admin_name}</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Correo Notificaciones</span>
                        <p className="text-sm font-black text-[var(--text-primary)] px-5 py-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)]/50 shadow-sm">{info.admin_email}</p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="md:col-span-2 p-8 bg-sky-50/50 border-2 border-dashed border-sky-100 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[var(--bg-card)] rounded-[2rem] flex items-center justify-center text-sky-500 shadow-xl shadow-sky-100 flex-shrink-0">
                        <Icon name="Info" className="text-3xl font-bold w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-base font-black text-[var(--text-primary)] tracking-tight">¿Necesitas actualizar esta información?</p>
                        <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">Los cambios deben solicitarse mediante un ticket de categoría Administrativo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
