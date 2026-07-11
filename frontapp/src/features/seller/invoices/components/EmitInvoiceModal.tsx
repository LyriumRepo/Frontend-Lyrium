'use client';

import React, { useState, useEffect } from 'react';
import { VoucherType } from '@/features/seller/invoices/types';
import { EmitInvoicePayload } from '@/features/seller/invoices/hooks/useSellerInvoices';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

interface EmitInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEmit: (payload: EmitInvoicePayload) => Promise<{ success: boolean; error?: string }>;
}

type ModalState = 'form' | 'loading' | 'success' | 'error';

const TYPE_OPTIONS: { value: VoucherType; label: string; icon: string; desc: string }[] = [
    { value: 'FACTURA', label: 'Factura', icon: 'FileText', desc: 'Para empresas con RUC activo' },
    { value: 'BOLETA', label: 'Boleta', icon: 'Receipt', desc: 'Para personas naturales' },
    { value: 'NOTA_CREDITO', label: 'Nota Crédito', icon: 'Undo', desc: 'Anular o corregir otro comprobante' },
];

const EMPTY_FORM = {
    type: 'FACTURA' as VoucherType,
    customer_name: '',
    customer_ruc: '',
    series: 'F001',
    number: '',
    amount: '',
    order_id: '',
};

export default function EmitInvoiceModal({ isOpen, onClose, onEmit }: EmitInvoiceModalProps) {
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [state, setState] = useState<ModalState>('form');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({ ...EMPTY_FORM });
            setState('form');
            setErrorMsg('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && state !== 'loading') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, state]);

    const set = (field: keyof typeof EMPTY_FORM) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm(p => ({ ...p, [field]: e.target.value }));

    const isValid =
        form.customer_name.trim() &&
        form.customer_ruc.trim().length >= 8 &&
        form.series.trim() &&
        form.number.trim() &&
        Number(form.amount) > 0 &&
        form.order_id.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        setState('loading');

        const payload: EmitInvoicePayload = {
            seller_id: 'SELLER-001',
            seller_name: 'Vendedor Demo',
            type: form.type,
            customer_name: form.customer_name.trim(),
            customer_ruc: form.customer_ruc.trim(),
            series: form.series.trim(),
            number: form.number.trim(),
            amount: Number(form.amount),
            order_id: form.order_id.trim(),
        };

        const result = await onEmit(payload);
        if (result.success) {
            setState('success');
        } else {
            setErrorMsg(result.error ?? 'Error al conectar con Rapifac');
            setState('error');
        }
    };

    const renderContent = () => {
        if (state === 'loading') {
            return (
                <div className="p-8 flex flex-col items-center gap-6 text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-emerald-100 rounded-full" />
                        <div className="w-20 h-20 border-4 border-t-emerald-500 rounded-full animate-spin absolute top-0 left-0" />
                        <Icon name="Receipt" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] animate-pulse">
                            Enviando a Rapifac...
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                            Obteniendo token y emitiendo comprobante en SUNAT
                        </p>
                    </div>
                </div>
            );
        }

        if (state === 'success') {
            return (
                <div className="p-8 flex flex-col items-center gap-6 text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
                        <Icon name="CheckCircle2" className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[var(--text-primary)]">
                            ¡Factura emitida con éxito!
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-2 max-w-xs mx-auto">
                            El comprobante fue enviado a SUNAT vía Rapifac.
                        </p>
                    </div>
                    <BaseButton onClick={onClose} variant="action">
                        Cerrar
                    </BaseButton>
                </div>
            );
        }

        if (state === 'error') {
            return (
                <div className="p-8 flex flex-col items-center gap-6 text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border-4 border-rose-100">
                        <Icon name="XCircle" className="w-10 h-10 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[var(--text-primary)]">
                            Error en la emisión
                        </h3>
                        <p className="text-xs text-[var(--text-danger)] font-bold mt-2 bg-[var(--bg-danger)] px-4 py-2 rounded-2xl border border-[var(--text-danger)]/20 max-w-xs mx-auto">
                            {errorMsg}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <BaseButton onClick={() => setState('form')} variant="ghost">
                            Corregir datos
                        </BaseButton>
                        <BaseButton onClick={onClose} variant="action">
                            Cancelar
                        </BaseButton>
                    </div>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 block">
                        Tipo de Comprobante
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                        {TYPE_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm(p => ({ ...p, type: opt.value }))}
                                className={`flex flex-col items-center gap-2 p-4 rounded-[1.5rem] border-2 transition-all text-center ${form.type === opt.value
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-100'
                                        : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                                    }`}
                            >
                                <Icon name={opt.icon} className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-wider">{opt.label}</span>
                                <span className="text-xs font-medium text-[var(--text-secondary)] leading-tight">{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="invoice-series" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">
                            Serie
                        </label>
                        <input
                            id="invoice-series"
                            type="text"
                            value={form.series}
                            onChange={set('series')}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-[var(--text-primary)]"
                        />
                    </div>
                    <div>
                        <label htmlFor="invoice-number" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">
                            Número
                        </label>
                        <input
                            id="invoice-number"
                            type="text"
                            value={form.number}
                            onChange={set('number')}
                            placeholder="0001"
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-[var(--text-primary)]"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="invoice-customer-name" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">
                        Nombre del Cliente
                    </label>
                    <input
                        id="invoice-customer-name"
                        type="text"
                        value={form.customer_name}
                        onChange={set('customer_name')}
                        placeholder="Razón Social o Nombre"
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-[var(--text-primary)]"
                    />
                </div>

                <div>
                    <label htmlFor="invoice-customer-ruc" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">
                        RUC o DNI
                    </label>
                    <input
                        id="invoice-customer-ruc"
                        type="text"
                        value={form.customer_ruc}
                        onChange={set('customer_ruc')}
                        placeholder="11 dígitos para RUC"
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-[var(--text-primary)]"
                    />
                </div>

                <div>
                    <label htmlFor="invoice-order-id" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">
                        ID del Pedido
                    </label>
                    <input
                        id="invoice-order-id"
                        type="text"
                        value={form.order_id}
                        onChange={set('order_id')}
                        placeholder="ORDER-001"
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-[var(--text-primary)]"
                    />
                </div>

                <div>
                    <label htmlFor="invoice-amount" className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">
                        Monto Total (S/)
                    </label>
                    <input
                        id="invoice-amount"
                        type="number"
                        step="0.01"
                        value={form.amount}
                        onChange={set('amount')}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-[var(--text-primary)] text-lg"
                    />
                </div>

                <BaseButton
                    type="submit"
                    disabled={!isValid}
                    variant="action"
                    className="w-full justify-center"
                    leftIcon="Send"
                >
                    Emitir Comprobante
                </BaseButton>
            </form>
        );
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Factura Electrónica"
            subtitle="Rapifac · SUNAT"
            size="lg"
            accentColor="from-emerald-500 to-sky-500"
        >
            {renderContent()}
        </BaseModal>
    );
}
