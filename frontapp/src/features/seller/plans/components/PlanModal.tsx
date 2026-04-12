'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';
import type { Plan, DurationPreset, PaymentSummary } from '../types';

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan | null;
    summary: PaymentSummary;
    durationPresets: DurationPreset[];
    selectedPresetId: string;
    customMonths: number;
    onSelectPreset: (id: string) => void;
    onChangeCustomMonths: (months: number) => void;
    onProcessPayment: () => void;
    isProcessing: boolean;
    step: 1 | 2;
    onGoToStep: (step: 1 | 2) => void;
}

export default function PlanModal({
    isOpen,
    onClose,
    plan,
    summary,
    durationPresets,
    selectedPresetId,
    customMonths,
    onSelectPreset,
    onChangeCustomMonths,
    onProcessPayment,
    isProcessing,
    step,
    onGoToStep
}: PlanModalProps) {
    const formatPrice = (price: number, currency: string = 'S/') => {
        return `${currency} ${price.toFixed(2)}`;
    };

    const handleCustomMonthsChange = (delta: number) => {
        const newVal = customMonths + delta;
        if (newVal >= 4 && newVal <= 48) {
            onChangeCustomMonths(newVal);
        }
    };

    const isTrial = selectedPresetId === 'trial';

    if (!plan) return null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={step === 1 ? `Suscribirse a ${plan.name}` : 'Pago con Izipay'}
            subtitle={step === 1 ? plan.description : undefined}
            size="lg"
            accentColor={plan.cssColor}
        >
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Selecciona la duración</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {durationPresets.map((preset) => (
                                <button
                                    key={preset.id}
                                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                                        selectedPresetId === preset.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-[var(--border-subtle)] hover:border-[var(--border-subtle)]'
                                    }`}
                                    onClick={() => onSelectPreset(preset.id)}
                                >
                                    <div className="font-semibold">{preset.label}</div>
                                    {preset.isTrial && (
                                        <div className="text-xs text-green-600 mt-1">Gratis</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedPresetId === 'custom' && (
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-gray-100"
                                    onClick={() => handleCustomMonthsChange(-1)}
                                >
                                    <Icon name="Minus" className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    className="w-20 text-center p-2 border border-[var(--border-subtle)] rounded-lg"
                                    value={customMonths}
                                    min={4}
                                    max={48}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 4;
                                        const clamped = Math.min(48, Math.max(4, val));
                                        onChangeCustomMonths(clamped);
                                    }}
                                />
                                <button
                                    className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-gray-100"
                                    onClick={() => handleCustomMonthsChange(1)}
                                >
                                    <Icon name="Plus" className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2">
                                <span>4 meses</span>
                                <span>48 meses</span>
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Plan</span>
                            <span className="font-semibold">{summary.planName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Duración</span>
                            <span className="font-semibold">{summary.duration}</span>
                        </div>
                        
                        {(summary.discount ?? 0) > 0 && (
                            <>
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <span>Precio original</span>
                                    <span className="line-through">{formatPrice(summary.originalPrice ?? 0, plan.currency)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Descuento</span>
                                    <span className="font-semibold">-{formatPrice(summary.discount ?? 0, plan.currency)}</span>
                                </div>
                            </>
                        )}
                        
                        <div className="border-t border-[var(--border-subtle)] my-2"></div>
                        
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total a pagar</span>
                            <span style={{ color: plan.cssColor }}>
                                {isTrial ? 'Gratis' : formatPrice(summary.total, plan.currency)}
                            </span>
                        </div>

                        {!isTrial && (summary.perMonth ?? 0) > 0 && (
                            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                                <span>Equivale a</span>
                                <span>{formatPrice(summary.perMonth ?? 0, plan.currency)}/mes</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {isTrial ? (
                            <button
                                className="flex-1 py-3 px-6 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                                onClick={onProcessPayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Procesando...' : 'Activar prueba gratuita'}
                            </button>
                        ) : (
                            <button
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: plan.cssColor }}
                                onClick={() => onGoToStep(2)}
                                disabled={isProcessing}
                            >
                                <span>Siguiente — Elegir método de pago</span>
                                <Icon name="ArrowRight" className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <button
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
                        onClick={() => onGoToStep(1)}
                    >
                        <Icon name="ArrowLeft" className="w-4 h-4" />
                        <span>Volver al resumen</span>
                    </button>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                            <Icon name="Shield" className="w-5 h-5" />
                            <span className="font-semibold">Pago 100% seguro procesado por Izipay</span>
                        </div>
                        <p className="text-sm text-green-600">Paga con tarjeta, Yape o Plin</p>
                    </div>

                    <button
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 text-white font-semibold rounded-xl"
                        style={{ backgroundColor: plan.cssColor }}
                        onClick={onProcessPayment}
                        disabled={isProcessing}
                    >
                        <Icon name="CreditCard" className="w-5 h-5" />
                        <span>{isProcessing ? 'Iniciando pago...' : 'PAGAR AHORA'}</span>
                    </button>

                    <p className="text-center text-xs text-[var(--text-secondary)]">
                        Tus datos de pago están protegidos por conexión cifrada SSL
                    </p>
                </div>
            )}
        </BaseModal>
    );
}
