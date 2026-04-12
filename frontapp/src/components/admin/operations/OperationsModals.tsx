import React, { useState } from 'react';
import { Provider, ProviderType } from '@/lib/types/admin/operations';
import { UserPlus, ShieldCheck } from 'lucide-react';

export const ProviderModal: React.FC<{
    provider: Provider | null;
    onClose: () => void;
    onSave: (provider: Partial<Provider>) => void;
}> = ({ provider, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Provider>>(
        provider || { tipo: 'Economista', estado: 'Activo', proyectos: [], certificaciones: [], total_recibos: 0, total_gastado: 0 }
    );

    const getDynamicFields = (type: ProviderType) => {
        const fields = {
            Ingeniero: [
                { label: 'Historial de Proyectos', key: 'proyectos', placeholder: 'Proyecto A, Proyecto B' },
                { label: 'Certificaciones IT', key: 'certificaciones', placeholder: 'AWS, Azure' }
            ],
            Contador: [
                { label: 'Auditorías Realizadas', key: 'proyectos', placeholder: 'Cierre 2024, Auditoría Interna' },
                { label: 'Matrícula Profesional', key: 'certificaciones', placeholder: 'CPC-12345' }
            ],
            Economista: [
                { label: 'Análisis Sectoriales', key: 'proyectos', placeholder: 'Estudio Mercado, Proyección IPC' },
                { label: 'Especialidad Académica', key: 'certificaciones', placeholder: 'Master en Microeconomía' }
            ]
        };
        return fields[type] || fields.Economista;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (provider === null) return null;

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8 font-industrial">
            <div className="col-span-2 space-y-2">
                <label htmlFor="provider-nombre" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Nombre Completo del Proveedor</label>
                <input
                    id="provider-nombre"
                    type="text"
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    placeholder="Ej: Ing. Marco Aurelio"
                    className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-sm font-black text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/10"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="provider-ruc" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">RUC / DNI (Legal)</label>
                <input
                    id="provider-ruc"
                    type="text"
                    value={formData.ruc || ''}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    required
                    maxLength={11}
                    className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-sm font-bold text-[var(--text-primary)]"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="provider-tipo" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Perfil Operativo</label>
                <select
                    id="provider-tipo"
                    value={formData.tipo || 'Economista'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ProviderType })}
                    className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)]"
                >
                    <option value="Economista">Economista</option>
                    <option value="Contador">Contador</option>
                    <option value="Ingeniero">Ingeniero</option>
                </select>
            </div>

            <div className="col-span-2 p-6 bg-sky-500/10 rounded-[2rem] border border-sky-500/20 space-y-6">
                <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest text-center">Campos Dinámicos por Especialidad</p>
                <div className="grid grid-cols-2 gap-6">
                    {getDynamicFields(formData.tipo || 'Economista').map((field) => (
                        <div key={field.key} className="space-y-1">
                            <label htmlFor={`provider-${field.key}`} className="text-[9px] font-black text-[var(--text-muted)] uppercase">{field.label}</label>
                            <input
                                id={`provider-${field.key}`}
                                type="text"
                                value={formData[field.key as keyof Provider]?.toString() || ''}
                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value.split(',').map(x => x.trim()) })}
                                className="w-full p-2 bg-[var(--bg-card)] rounded-xl text-[11px] font-bold border-none text-[var(--text-primary)]"
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="provider-estado" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Estado de Vínculo</label>
                <select
                    id="provider-estado"
                    value={formData.estado || 'Activo'}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)]"
                >
                    <option value="Activo">Activo</option>
                    <option value="Suspendido">En Pausa</option>
                    <option value="Finalizado">Finalizado</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="provider-renovacion" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Fecha de Renovación</label>
                <input
                    id="provider-renovacion"
                    type="date"
                    value={formData.fecha_renovacion || ''}
                    onChange={(e) => setFormData({ ...formData, fecha_renovacion: e.target.value })}
                    className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-bold text-[var(--text-primary)]"
                />
            </div>

            <div className="col-span-2 pt-6 flex gap-4">
                <button
                    type="submit"
                    className="flex-1 py-5 bg-sky-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl shadow-black/5"
                >
                    Actualizar Registro Operativo
                </button>
            </div>
        </form>
    );
};


export const TwoFactorModalContent: React.FC<{
    onVerify: (code: string) => boolean;
    onClose: () => void;
}> = ({ onVerify, onClose }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onVerify(code);
        if (success) {
            setCode('');
        } else {
            alert('Código de verificación incorrecto. Intente con 123456');
        }
    };

    const handleClose = () => {
        setCode('');
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 font-industrial">
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="------"
                maxLength={6}
                className="w-full text-4xl font-black text-center tracking-[1rem] py-6 bg-[var(--bg-input)] border-none rounded-3xl focus:ring-4 focus:ring-sky-500/10 placeholder:text-[var(--text-muted)] font-industrial text-[var(--text-primary)]"
            />

            <div className="flex flex-col gap-3">
                <button
                    type="submit"
                    className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase hover:bg-sky-600 transition-all"
                >
                    Validar Acceso
                </button>
            </div>
        </form>
    );
};
