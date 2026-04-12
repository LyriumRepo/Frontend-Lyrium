'use client';

import { X, Eye, EyeOff, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    email: string;
    onClose: () => void;
}

export default function ModalRegistroUsuario({ isOpen, email, onClose }: Props) {
    const [showPass, setShowPass] = useState(false);
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        await new Promise((r) => setTimeout(r, 2000));
        setStatus('success');
        setTimeout(() => onClose(), 1500);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm z-[1400] animate-fade-in" />

            {/* Modal */}
            <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white dark:bg-[var(--bg-card)] w-full max-w-md shadow-2xl relative flex flex-col rounded-[2.5rem] overflow-hidden animate-modal-pop max-h-[90vh]">

                    {/* Header */}
                    <div className="relative h-32 shrink-0 flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600">
                        <div className="relative z-20 flex flex-col items-center justify-center p-6 gap-3 text-center">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-xl animate-floating-bounce">
                                <span className="text-4xl drop-shadow-lg">🪪</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-white uppercase">Panel de Usuario Lyrium</h3>
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Protección de Perfil</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all z-30 border border-white/20">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="bg-white dark:bg-[var(--bg-card)] p-5 space-y-4 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#bae6fd_transparent]">
                        <div className="space-y-3">
                            <div className="text-center space-y-1.5">
                                <span className="text-[8px] font-black text-sky-500 uppercase tracking-[0.3em]">Protocolo de Activación</span>
                                <h2 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">Reclama tu panel personal.</h2>
                                <p className="text-[11px] text-gray-400 dark:text-[var(--text-muted)] font-medium leading-relaxed">Establece tu llave de acceso privada para gestionar tus pedidos.</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { icon: '🚚', label: 'Tracking', bg: 'bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30 text-sky-500 dark:text-sky-400' },
                                    { icon: '🧾', label: 'Facturas', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30 text-emerald-500 dark:text-emerald-400' },
                                    { icon: '🌐', label: 'Global', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30 text-purple-500 dark:text-purple-400' },
                                ].map(({ icon, label, bg }) => (
                                    <div key={label} className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 group ${bg}`}>
                                        <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
                                        <span className="text-[7px] font-bold text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-wider">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-bold text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest pl-1">E-mail Detectado</label>
                                <div className="px-4 py-2.5 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-xl text-gray-500 dark:text-[var(--text-muted)] font-bold text-sm flex items-center gap-3">
                                    <span className="text-sky-400 text-lg">@</span>
                                    <span className="w-full truncate">{email}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[8px] font-bold text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest pl-1">Crea tu llave de acceso</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-sky-500 transition-colors">
                                        🔒
                                    </div>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-gray-900 dark:text-[var(--text-primary)] font-bold text-sm focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-sky-900/30 focus:border-sky-500 dark:focus:border-[var(--brand-sky)] transition-all"
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-500 transition-colors">
                                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-1.5 space-y-2.5">
                                <button
                                    type="submit"
                                    disabled={status !== 'idle'}
                                    className={`w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${status === 'success'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-900 dark:bg-[var(--bg-secondary)] text-white hover:bg-sky-500 hover:-translate-y-0.5 active:translate-y-0'
                                        } disabled:opacity-70`}
                                >
                                    {status === 'loading' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {status === 'success' && <Check className="w-4 h-4" />}
                                    {status === 'idle' ? 'Activar Mi Panel de Usuario' : status === 'loading' ? 'Activando...' : 'IDENTIDAD LYRIUM ACTIVADA'}
                                </button>

                                <div className="flex flex-col items-center gap-1.5 pt-1">
                                    <a href="/login" className="text-[8px] font-bold text-sky-500 uppercase tracking-widest hover:text-sky-600 transition-colors flex items-center gap-1">
                                        Acceso Miembros Lyrium →
                                    </a>
                                    <button type="button" onClick={onClose} className="text-[8px] font-bold text-gray-300 dark:text-[var(--text-muted)] uppercase tracking-widest hover:text-rose-500 transition-all">
                                        Continuar como invitado
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
