'use client';

import React, { useState } from 'react';
import {
    ShieldAlert,
    Activity,
    ShieldCheck,
    ChevronRight,
    AlertTriangle,
    Fingerprint,
    Key,
    Lock,
    Settings,
    Search
} from 'lucide-react';

interface Alert {
    id: number;
    level: 'CRITICAL' | 'SECURITY' | 'OPERATIONAL';
    source: string;
    message: string;
    timestamp: string;
    status: 'pending' | 'resolved';
}

const MOCK_ALERTS: Alert[] = [
    { id: 1, level: 'CRITICAL', source: 'Inventario', message: 'Stock crítico detectado en 12 productos (RF-01)', timestamp: 'Hace 2 min', status: 'pending' },
    { id: 2, level: 'SECURITY', source: 'Auth Engine', message: 'Múltiples intentos fallidos en cuenta Admin (RF-04)', timestamp: 'Hace 15 min', status: 'pending' },
    { id: 3, level: 'OPERATIONAL', source: 'Moderación', message: 'Subida masiva detectada: 150 productos en espera (RF-03)', timestamp: 'Hace 45 min', status: 'resolved' },
    { id: 4, level: 'SECURITY', source: 'Admin Panel', message: 'Contraseña de vendedor forzada a cambio por antigüedad (RF-04)', timestamp: 'Hace 1 hora', status: 'resolved' },
];

export const SecurityAlertsCenter: React.FC = () => {
    const [alerts] = useState<Alert[]>(MOCK_ALERTS);

    const getLevelUI = (level: Alert['level']) => {
        switch (level) {
            case 'CRITICAL': return { color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', icon: <ShieldAlert className="w-5 h-5" />, label: 'Rojo (Crítico)' };
            case 'SECURITY': return { color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', icon: <Lock className="w-5 h-5" />, label: 'Naranja (Seguridad)' };
            case 'OPERATIONAL': return { color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', icon: <Activity className="w-5 h-5" />, label: 'Azul (Operativo)' };
        }
    };

    return (
        <div className="space-y-8 font-industrial">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Real-time Activity Feed (RF-01) */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Live Monitor</h3>
                            <p className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                                Feed de Actividad Proactiva (RF-01)
                            </p>
                        </div>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-8 space-y-4">
                        {alerts.map(alert => {
                            const ui = getLevelUI(alert.level);
                            return (
                                <div key={alert.id} className="group flex items-center gap-6 p-4 rounded-3xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all cursor-pointer">
                                    <div className={`w-12 h-12 rounded-2xl ${ui.bg} ${ui.text} flex items-center justify-center shadow-sm`}>
                                        {ui.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black text-white uppercase tracking-widest ${ui.color}`}>
                                                {ui.label}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{alert.source}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{alert.message}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">{alert.timestamp}</p>
                                        <div className="flex justify-end mt-1">
                                            {alert.status === 'pending' ? (
                                                <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                                            ) : (
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Motor de Detección Requerido (RF-01) */}
                <div className="lg:col-span-4 bg-sky-500 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <h3 className="text-[10px] font-black text-sky-200 uppercase tracking-widest mb-6">Parámetros del Motor (RF-01)</h3>
                    <p className="text-xl font-black mb-8 leading-tight">Configuración de Alertas Proactivas</p>

                    <div className="space-y-6 relative z-10">
                        {/* Sensibilidad de Stock */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-gray-400 italic">Umbral Alerta Stock Crítico</span>
                                <span>5 Unid.</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-[20%] bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
                            </div>
                        </div>

                        {/* Toggles enfocados en RFs */}
                        <div className="space-y-4 pt-4">
                            <label htmlFor="toggle-rf03" className="flex items-center justify-between cursor-pointer group">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">Alertar Subidas Masivas (RF-03)</span>
                                <div className="w-10 h-6 bg-emerald-500 rounded-full relative p-1 transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                                </div>
                            </label>
                            <label htmlFor="toggle-rf04" className="flex items-center justify-between cursor-pointer group">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">Detección de Intentos Fallidos (RF-04)</span>
                                <div className="w-10 h-6 bg-indigo-500 rounded-full relative p-1 transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                                </div>
                            </label>
                            <label htmlFor="toggle-inactivity" className="flex items-center justify-between cursor-pointer group">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Notificar Inactividad de Vendedores</span>
                                <div className="w-10 h-6 bg-gray-700 rounded-full relative p-1 transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-12 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 italic">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-amber-500">Alertas de Credenciales (RF-04)</p>
                                <p className="text-[11px] font-medium text-gray-400 mt-1 leading-relaxed">
                                    Existen <span className="text-white font-black">12 cuentas</span> con contraseñas que expiran en <span className="text-white font-black">menos de 7 días</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Credential Statistics (RF-04) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 tracking-tighter italic">12h</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MTTR Promedio</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 tracking-tighter italic">100%</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inmutabilidad Log (WORM)</p>
                    </div>
                </div>
                <div className="bg-emerald-900 p-8 rounded-[2.5rem] flex items-center gap-6 text-white shadow-xl shadow-emerald-100">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-emerald-300">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest italic leading-none">Status: Blindado</p>
                        <p className="text-[9px] font-medium text-emerald-400/80 uppercase tracking-wider mt-1">Sincronizado con Nodo Central</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- AUDITORIA FORENSE INMUTABLE (RF-04) ---
export const ImmutableAuditLog: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden font-industrial">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/20 gap-4">
                <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Forensic Log (WORM: Write Once Read Many)</h3>
                    <p className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-indigo-600" />
                        Historial Consultable con Filtros Avanzados (RF-04)
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar en el Ledger..."
                            className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>
                    <button className="px-6 py-3 bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl">
                        Exportar SHA-256
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/30 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Timestamp Epoch</th>
                            <th className="px-8 py-5">Entidad Auditada</th>
                            <th className="px-8 py-5">Acción Crítica</th>
                            <th className="px-8 py-5">Metadato / Justificación</th>
                            <th className="px-8 py-5 text-right">Firma Digital</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[
                            { id: 'TX-9921', user: 'admin_lyrium', action: 'SUSPENSIÓN', entity: 'Vendedor: EcoS.A.', reason: 'Incumplimiento contractual detectado por RF-16', time: '2024-02-20 08:32:15' },
                            { id: 'TX-9922', user: 'system_bot', action: 'PWD_FORCE_CHANGE', entity: 'Vendedor: BioLab', reason: 'Política de expiración automática (RF-04)', time: '2024-02-20 09:15:00' },
                            { id: 'TX-9923', user: 'admin_lyrium', action: 'DOC_UPDATE', entity: 'Contrato 2024A', reason: 'Renovación de garantía bancaria', time: '2024-02-20 10:45:11' },
                        ].map(entry => (
                            <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <p className="text-xs font-bold text-gray-800">{entry.time}</p>
                                    <p className="text-[9px] text-indigo-500 font-black font-mono">ID: {entry.id}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-xs font-black text-gray-700 uppercase">{entry.entity}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-sky-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                                        {entry.action}
                                    </span>
                                </td>
                                <td className="px-8 py-5 max-w-xs">
                                    <p className="text-[10px] font-medium text-gray-500 italic leading-relaxed">
                                        {entry.reason}
                                    </p>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex flex-col items-end opacity-20 group-hover:opacity-100 transition-opacity">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-emerald-500"></div>
                                        </div>
                                        <span className="text-[8px] font-mono text-gray-400 mt-1 uppercase">Valid (Node 01)</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- GESTIÓN DE ROLES DINÁMICOS (RF-13) ---
export const DynamicRolesManager: React.FC = () => {
    return (
        <div className="space-y-8 font-industrial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Permisos Jerárquicos Configurables */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Motor de Roles por Jerarquía (RF-13)</h3>
                    <div className="space-y-6">
                        {[
                            { role: 'Super Admin', permissions: 'Acceso Total + Revocación RT', color: 'bg-rose-500' },
                            { role: 'Moderador (Proveedor)', permissions: 'RF-03 + Categorización', color: 'bg-indigo-500' },
                            { role: 'Auditor Financiero', permissions: 'Tesorería + RF-14/15', color: 'bg-emerald-500' },
                        ].map((r) => (
                            <div key={r.role} className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <div className={`w-3 h-12 ${r.color} rounded-full`}></div>
                                <div className="flex-1">
                                    <p className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none mb-1">{r.role}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{r.permissions}</p>
                                </div>
                                <button className="text-[10px] font-black text-indigo-600 hover:bg-white px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-indigo-100">
                                    Configurar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revocación en Tiempo Real */}
                <div className="bg-sky-500 text-white p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-sky-100/20">
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mb-40 blur-3xl"></div>
                    <div>
                        <div className="p-4 bg-rose-500/10 text-rose-500 w-fit rounded-2xl mb-6 border border-rose-500/20">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter mb-4 italic leading-tight">Revocación de Credenciales en Tiempo Real</h3>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-sm">
                            Este motor desconecta automáticamente cualquier sesión activa si se detectan anomalías en el <span className="text-rose-400 underline underline-offset-4">Activity Feed de Seguridad</span>.
                        </p>
                    </div>

                    <div className="mt-12 space-y-4 relative z-10">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Moderador_External_01</span>
                            </div>
                            <button className="px-6 py-3 bg-rose-600 hover:bg-rose-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Revocar Acceso
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
