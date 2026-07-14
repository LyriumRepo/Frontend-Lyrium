'use client';

import React, { useState } from 'react';
import ModalsPortal from '@/components/layout/shared/ModalsPortal';
import { X, Store, Mail, Phone, CheckCircle2, ShieldAlert, ChevronDown, CheckCircle, Sparkles, Calendar, User } from 'lucide-react';
import BaseButton from '@/components/ui/BaseButton';

interface SellerManagementDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contracts: any[];
    onAddSeller: (sellerData: any) => void;
}

export default function SellerManagementDetailsModal({ isOpen, onClose, contracts = [], onAddSeller }: SellerManagementDetailsModalProps) {
    const [selectedContractId, setSelectedContractId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const selectedContract = contracts.find(c => c.id === selectedContractId);

    const getStatusText = (status: string) => {
        if (status === 'ACTIVE') return 'Activo';
        if (status === 'PENDING') return 'En proceso';
        return 'Suspendido';
    };

    const getStatusColor = (statusText: string) => {
        if (statusText === 'Activo') return 'text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20';
        if (statusText === 'Suspendido') return 'text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20';
        return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20';
    };

    const handleVerifyEmail = () => {
        if (!email) return;
        setIsVerifying(true);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        setIsVerifying(false);
        setIsVerified(isValid);
    };

    const handleEmailChange = (val: string) => {
        setEmail(val);
        setIsVerified(false);
    };

    const handleSubmit = () => {
        if (!selectedContract) return;

        const mappedSeller = {
            id: Date.now(),
            name: selectedContract.rep,
            company: selectedContract.company,
            email: email,
            phone: phone,
            status: selectedContract.status === 'ACTIVE' ? 'ACTIVE' : selectedContract.status === 'PENDING' ? 'PENDING' : 'SUSPENDED',
            regDate: selectedContract.start || new Date().toLocaleDateString('es-PE'),
            contractStatus: selectedContract.status === 'ACTIVE' ? 'VIGENTE' : selectedContract.status === 'PENDING' ? 'PENDIENTE' : 'VENCIDO',
            email_verified: isVerified,
            has_alerts: false,
            alerts: [],
            store: {
                id: Date.now() + 1,
                status: selectedContract.status === 'ACTIVE' ? 'active' : selectedContract.status === 'PENDING' ? 'pending' : 'suspended',
                strikes: 0,
                rating: 5.0,
                total_sales: 0,
                logo: null
            }
        };

        onAddSeller(mappedSeller);
        setIsSubmitted(true);
    };

    const handleClose = () => {
        setSelectedContractId('');
        setEmail('');
        setPhone('');
        setIsVerified(false);
        setIsVerifying(false);
        setIsSubmitted(false);
        onClose();
    };

    return (
        <ModalsPortal>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/75 dark:bg-black/85 backdrop-blur-md animate-fadeIn"
                    onClick={handleClose}
                />

                <div className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] w-full max-w-5xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden font-industrial animate-scaleUp flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-4 sm:p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-muted)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-2xl border border-[var(--color-success)]/20">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
                                    Gestión Estratégica de Vendedores
                                </h2>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-black mt-0.5">
                                    Asignación y Alta Operativa de Cuentas
                                </p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--icons-green)] hover:bg-[var(--icons-green)]/5 rounded-xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-6 sm:space-y-8 bg-[var(--bg-card)]">
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 animate-fadeIn">
                                <div className="w-24 h-24 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30 flex items-center justify-center animate-bounce">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">Vendedor Vinculado</h3>
                                    <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
                                        El vendedor <span className="font-bold text-[var(--text-primary)]">{selectedContract?.company}</span> ha sido agregado con éxito a la Gestión Estratégica de Vendedores.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <BaseButton onClick={handleClose} variant="secondary" size="md">
                                        Entendido, Cerrar
                                    </BaseButton>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label htmlFor="contract-select" className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 ml-2">
                                        Selecciona un vendedor
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="contract-select"
                                            value={selectedContractId}
                                            onChange={(e) => setSelectedContractId(e.target.value)}
                                            className="w-full p-5 bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-2xl font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--icons-green)]/10 focus:border-[var(--border-focus)] appearance-none transition-all cursor-pointer text-sm"
                                        >
                                            <option value="" className="bg-[var(--bg-card)] text-[var(--text-secondary)]">-- Selecciona un vendedor --</option>
                                            {contracts.map((c) => (
                                                <option key={c.id} value={c.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                                                    {c.company} ({c.id}) - [{getStatusText(c.status)}]
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                {!selectedContractId ? (
                                    <div className="py-20 border border-dashed border-[var(--border-subtle)] rounded-[2rem] bg-[var(--bg-muted)] flex flex-col items-center justify-center text-center p-8 space-y-4">
                                        <Store className="w-12 h-12 text-[var(--text-muted)]" />
                                        <div className="space-y-1">
                                            <p className="text-[var(--text-secondary)] font-bold uppercase text-xs tracking-wider">Esperando Selección</p>
                                            <p className="text-[11px] text-[var(--text-muted)] max-w-sm">
                                                Seleccione un contrato del listado superior para cargar la información automática de la cuenta y la tienda.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 animate-fadeIn">
                                        <div className="bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-[2rem] p-4 sm:p-8 space-y-6">
                                            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
                                                <User className="w-5 h-5 text-[var(--icons-green)]" />
                                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Datos del Usuario</h3>
                                            </div>

                                            <div className="space-y-5">
                                                <div>
                                                    <span className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Nombre</span>
                                                    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 text-sm font-bold text-[var(--text-primary)]">
                                                        {selectedContract.rep}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Estado de Cuenta</span>
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(getStatusText(selectedContract.status))}`}>
                                                        {getStatusText(selectedContract.status)}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">RUC</span>
                                                    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 text-sm font-mono text-[var(--text-primary)] font-bold select-all">
                                                        {selectedContract.ruc}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Registro</span>
                                                    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 text-sm text-[var(--text-primary)] font-bold flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                                                        {selectedContract.start}
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-5">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label htmlFor="email" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Registrar Email de Vendedor</label>
                                                            {email && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isVerifying || isVerified}
                                                                    onClick={handleVerifyEmail}
                                                                    className={`text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all ${
                                                                        isVerified
                                                                            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20'
                                                                            : 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]'
                                                                    }`}
                                                                >
                                                                    {isVerifying ? 'Verificando...' : isVerified ? '✓ Formato válido' : 'Validar formato'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                                            <input
                                                                id="email"
                                                                type="email"
                                                                value={email}
                                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                                placeholder="correo@ejemplo.com"
                                                                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-4 focus:ring-[var(--icons-green)]/5 transition-all placeholder:text-[var(--text-muted)]"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="phone" className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Registrar Número Telefónico</label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                                            <input
                                                                id="phone"
                                                                type="tel"
                                                                value={phone}
                                                                onChange={(e) => setPhone(e.target.value)}
                                                                placeholder="+51 999 999 999"
                                                                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl py-3.5 pl-12 pr-4 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--border-focus)] focus:ring-4 focus:ring-[var(--icons-green)]/5 transition-all placeholder:text-[var(--text-muted)]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-[2rem] p-4 sm:p-8 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
                                                    <Store className="w-5 h-5 text-[var(--icons-green)]" />
                                                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                                                        Tienda: {selectedContract.company}
                                                    </h3>
                                                </div>

                                                <div className="space-y-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">RUC</span>
                                                        <span className="text-sm text-[var(--text-primary)] font-mono font-black">{selectedContract.ruc}</span>
                                                    </div>

                                                    <div className="h-px bg-[var(--border-subtle)]" />

                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Razón Social</span>
                                                        <span className="text-sm text-[var(--text-primary)] font-black">{selectedContract.company}</span>
                                                    </div>

                                                    <div className="h-px bg-[var(--border-subtle)]" />

                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Representante Legal</span>
                                                        <span className="text-sm text-[var(--text-primary)] font-black">{selectedContract.rep}</span>
                                                    </div>

                                                    <div className="h-px bg-[var(--border-subtle)]" />

                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Aprobada</span>
                                                        <span className="text-sm text-[var(--icons-green)] font-black flex items-center gap-1.5">
                                                            <CheckCircle className="w-4 h-4" /> {selectedContract.start}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 mt-8 border-t border-[var(--border-subtle)]">
                                                <div className="flex items-start gap-3 p-4 bg-[var(--icons-green)]/5 rounded-2xl border border-[var(--icons-green)]/10">
                                                    <ShieldAlert className="w-5 h-5 text-[var(--icons-green)] shrink-0 mt-0.5" />
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wider">Módulo de Tienda Legitimado</p>
                                                        <p className="text-[10px] text-[var(--text-secondary)] leading-normal">
                                                            Toda la información ha sido contrastada automáticamente y de forma bidireccional con el padrón de contratos vigentes.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!isSubmitted && (
                        <div className="p-4 sm:p-8 border-t border-[var(--border-subtle)] bg-[var(--bg-muted)] flex justify-end">
                            <BaseButton
                                onClick={handleSubmit}
                                disabled={!selectedContractId}
                                variant="secondary"
                                size="md"
                                className="w-full justify-center bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white font-black tracking-widest"
                            >
                                Agregar a Gestión Estratégica de Vendedores
                            </BaseButton>
                        </div>
                    )}
                </div>
            </div>
        </ModalsPortal>
    );
}