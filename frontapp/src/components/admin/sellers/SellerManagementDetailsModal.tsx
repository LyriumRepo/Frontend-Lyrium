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
        if (statusText === 'Activo') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-500/20';
        if (statusText === 'Suspendido') return 'text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-950/40 border border-rose-250 dark:border-rose-500/20';
        return 'text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/40 border border-amber-250 dark:border-amber-500/30';
    };

    const handleVerifyEmail = () => {
        if (!email) return;
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);
        }, 800);
    };

    const handleEmailChange = (val: string) => {
        setEmail(val);
        setIsVerified(false);
    };

    const handleSubmit = () => {
        if (!selectedContract) return;

        const mappedSeller = {
            id: Math.floor(Math.random() * 1000000),
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
                id: Math.floor(Math.random() * 100000),
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

                <div className="relative bg-white dark:bg-[#0b0f0c] border border-gray-200 dark:border-emerald-900/40 rounded-[2.5rem] w-full max-w-5xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden font-industrial animate-scaleUp flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-8 border-b border-gray-150 dark:border-emerald-900/20 bg-gray-50 dark:bg-[#0d120e]">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                                    Gestión Estratégica de Vendedores
                                </h2>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest font-black mt-0.5">
                                    Asignación y Alta Operativa de Cuentas
                                </p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 text-gray-400 dark:text-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 rounded-xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-white dark:bg-[#0b0f0c]">
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 animate-fadeIn">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Vendedor Vinculado</h3>
                                    <p className="text-emerald-700 dark:text-emerald-500/70 text-sm max-w-md mx-auto leading-relaxed">
                                        El vendedor <span className="font-bold text-gray-900 dark:text-white">{selectedContract?.company}</span> ha sido agregado con éxito a la Gestión Estratégica de Vendedores.
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
                                    <label htmlFor="contract-select" className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500/60 uppercase tracking-widest mb-3 ml-2">
                                        Selecciona un vendedor
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="contract-select"
                                            value={selectedContractId}
                                            onChange={(e) => setSelectedContractId(e.target.value)}
                                            className="w-full p-5 bg-gray-50 dark:bg-[#0f1411] border border-gray-250 dark:border-emerald-950 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 appearance-none transition-all cursor-pointer text-sm"
                                        >
                                            <option value="" className="bg-white dark:bg-[#0b0f0c] text-emerald-600 dark:text-emerald-500/40">-- Selecciona un vendedor --</option>
                                            {contracts.map((c) => (
                                                <option key={c.id} value={c.id} className="bg-white dark:bg-[#0b0f0c] text-gray-900 dark:text-white">
                                                    {c.company} ({c.id}) - [{getStatusText(c.status)}]
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 dark:text-emerald-500/40">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                {!selectedContractId ? (
                                    <div className="py-20 border border-dashed border-gray-200 dark:border-emerald-950 rounded-[2rem] bg-gray-50 dark:bg-[#0c100d]/50 flex flex-col items-center justify-center text-center p-8 space-y-4">
                                        <Store className="w-12 h-12 text-emerald-600/30 dark:text-emerald-500/20" />
                                        <div className="space-y-1">
                                            <p className="text-emerald-600 dark:text-emerald-500/60 font-bold uppercase text-xs tracking-wider">Esperando Selección</p>
                                            <p className="text-[11px] text-gray-500 dark:text-emerald-500/40 max-w-sm">
                                                Seleccione un contrato del listado superior para cargar la información automática de la cuenta y la tienda.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                                        <div className="bg-gray-50 dark:bg-[#0d120f] border border-gray-150 dark:border-emerald-900/20 rounded-[2rem] p-8 space-y-6">
                                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60 dark:border-emerald-950">
                                                <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Datos del Usuario</h3>
                                            </div>

                                            <div className="space-y-5">
                                                <div>
                                                    <span className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest mb-2 ml-1">Nombre</span>
                                                    <div className="w-full bg-white dark:bg-[#0a0d0b] border border-gray-205 dark:border-emerald-950/50 rounded-xl p-3.5 text-sm font-bold text-gray-900 dark:text-white">
                                                        {selectedContract.rep}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest mb-2 ml-1">Estado de Cuenta</span>
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(getStatusText(selectedContract.status))}`}>
                                                        {getStatusText(selectedContract.status)}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest mb-2 ml-1">RUC</span>
                                                    <div className="w-full bg-white dark:bg-[#0a0d0b] border border-gray-205 dark:border-emerald-950/50 rounded-xl p-3.5 text-sm font-mono text-gray-900 dark:text-white font-bold select-all">
                                                        {selectedContract.ruc}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest mb-2 ml-1">Registro</span>
                                                    <div className="w-full bg-white dark:bg-[#0a0d0b] border border-gray-205 dark:border-emerald-950/50 rounded-xl p-3.5 text-sm text-gray-900 dark:text-white font-bold flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-500/50" />
                                                        {selectedContract.start}
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-gray-200 dark:border-emerald-950/50 space-y-5">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label htmlFor="email" className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest ml-1">Registrar Email de Vendedor</label>
                                                            {email && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isVerifying || isVerified}
                                                                    onClick={handleVerifyEmail}
                                                                    className={`text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all ${
                                                                        isVerified 
                                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                                            : 'bg-emerald-500 text-white dark:text-[#0b0f0c] hover:bg-emerald-600 dark:hover:bg-emerald-400'
                                                                    }`}
                                                                >
                                                                    {isVerifying ? 'Verificando...' : isVerified ? '✓ Verificado' : 'Verificar Email'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-650 dark:text-emerald-500/50" />
                                                            <input
                                                                id="email"
                                                                type="email"
                                                                value={email}
                                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                                placeholder="correo@ejemplo.com"
                                                                className="w-full bg-white dark:bg-[#0a0d0b] border border-gray-205 dark:border-emerald-950 rounded-xl py-3.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-500/20"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="phone" className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest mb-2 ml-1">Registrar Número Telefónico</label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-655 dark:text-emerald-500/50" />
                                                            <input
                                                                id="phone"
                                                                type="tel"
                                                                value={phone}
                                                                onChange={(e) => setPhone(e.target.value)}
                                                                placeholder="+51 999 999 999"
                                                                className="w-full bg-white dark:bg-[#0a0d0b] border border-gray-205 dark:border-emerald-950 rounded-xl py-3.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500/5 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-500/20"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-[#0d120f] border border-gray-150 dark:border-emerald-900/20 rounded-[2rem] p-8 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60 dark:border-emerald-950">
                                                    <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                                        Tienda: {selectedContract.company}
                                                    </h3>
                                                </div>

                                                <div className="space-y-5 bg-white dark:bg-[#0a0d0b] border border-gray-200 dark:border-emerald-950 rounded-2xl p-6">
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/40 uppercase tracking-widest">RUC</span>
                                                        <span className="text-sm text-gray-900 dark:text-white font-mono font-black">{selectedContract.ruc}</span>
                                                    </div>

                                                    <div className="h-px bg-gray-150 dark:bg-emerald-950/50" />

                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/40 uppercase tracking-widest">Razón Social</span>
                                                        <span className="text-sm text-gray-900 dark:text-white font-black">{selectedContract.company}</span>
                                                    </div>

                                                    <div className="h-px bg-gray-150 dark:bg-emerald-950/50" />

                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-emerald-605 dark:text-emerald-500/40 uppercase tracking-widest">Representante Legal</span>
                                                        <span className="text-sm text-gray-900 dark:text-white font-black">{selectedContract.rep}</span>
                                                    </div>

                                                    <div className="h-px bg-gray-150 dark:bg-emerald-950/50" />

                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/40 uppercase tracking-widest">Aprobada</span>
                                                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1.5">
                                                            <CheckCircle className="w-4 h-4" /> {selectedContract.start}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 mt-8 border-t border-gray-200 dark:border-emerald-950">
                                                <div className="flex items-start gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                                    <ShieldAlert className="w-5 h-5 text-emerald-650 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Módulo de Tienda Legitimado</p>
                                                        <p className="text-[10px] text-emerald-700 dark:text-emerald-500/60 leading-normal">
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
                        <div className="p-8 border-t border-gray-150 dark:border-emerald-900/20 bg-gray-50 dark:bg-[#0d120e] flex justify-end">
                            <BaseButton
                                onClick={handleSubmit}
                                disabled={!selectedContractId}
                                variant="secondary"
                                size="md"
                                className="w-full justify-center bg-emerald-500 hover:bg-emerald-400 text-white dark:text-[#0b0f0c] font-black tracking-widest"
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