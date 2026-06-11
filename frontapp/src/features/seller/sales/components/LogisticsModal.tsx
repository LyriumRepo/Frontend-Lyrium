'use client';

import React, { useState, useMemo } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import CarrierFieldGroup from './CarrierFieldGroup';
import { CARRIERS, CARRIER_CODES, CarrierConfig, CarrierField } from '@/features/seller/sales/config/logistics';
import Icon from '@/components/ui/Icon';

interface LogisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (carrierCode: string, carrierData: Record<string, string>) => Promise<void>;
    /** Modo automático: carrier ya detectado desde la orden/shipment */
    detectedCarrier?: string | null;
    /** Datos existentes para edición (re-apertura del modal) */
    existingData?: Record<string, string> | null;
}

export default function LogisticsModal({
    isOpen,
    onClose,
    onConfirm,
    detectedCarrier,
    existingData,
}: LogisticsModalProps) {
    const [selectedCarrier, setSelectedCarrier] = useState<string>(
        () => detectedCarrier ?? existingData?.carrier_code ?? CARRIER_CODES[0]
    );
    const [formValues, setFormValues] = useState<Record<string, string>>(
        () => existingData ?? {}
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeCarrier: CarrierConfig | undefined = CARRIERS[selectedCarrier];

    const handleCarrierChange = (code: string) => {
        setSelectedCarrier(code);
        setFormValues({});
        setErrors({});
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!activeCarrier) {
            newErrors._form = 'Selecciona un operador logístico';
            setErrors(newErrors);
            return false;
        }
        for (const field of activeCarrier.fields) {
            const fieldDef = field as CarrierField;
            if (fieldDef.required && !formValues[fieldDef.key]?.trim()) {
                newErrors[fieldDef.key] = `${fieldDef.label} es obligatorio`;
            }
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }
        return true;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onConfirm(selectedCarrier, { ...formValues });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setErrors({});
            onClose();
        }
    };

    const isAuto = !!detectedCarrier;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Datos del Operador Logístico"
            subtitle={isAuto
                ? `Operador detectado: ${activeCarrier?.name ?? detectedCarrier}`
                : 'Selecciona el operador y completa los datos para el envío'
            }
            size="lg"
        >
            <div className="space-y-6">
                {errors._form && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                        <Icon name="AlertCircle" className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs font-bold text-red-600">{errors._form}</span>
                    </div>
                )}

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <Icon name="Info" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                        Al confirmar, se enviará un correo al cliente con los datos de seguimiento
                        y el estado del pedido cambiará a <strong>En transporte</strong>.
                    </p>
                </div>

                {/* Selector de operador: oculto si ya está detectado automáticamente */}
                {!isAuto && (
                    <div>
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                            Operador Logístico
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CARRIER_CODES.map((code) => {
                                const c = CARRIERS[code];
                                const isSelected = selectedCarrier === code;
                                return (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => handleCarrierChange(code)}
                                        disabled={isAuto}
                                        className={`
                                            px-4 py-3 rounded-xl text-sm font-bold text-left
                                            border-2 transition-all duration-200
                                            ${isSelected
                                                ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                                                : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-emerald-300 hover:bg-emerald-50/30'
                                            }
                                            ${isAuto ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        <Icon
                                            name="Truck"
                                            className={`w-4 h-4 inline mr-2 ${isSelected ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}
                                        />
                                        {c?.name ?? code}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeCarrier && (
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-2xl border border-[var(--border-subtle)]">
                        <CarrierFieldGroup
                            fields={activeCarrier.fields}
                            values={formValues}
                            errors={errors}
                            onChange={handleFieldChange}
                            disabled={isSubmitting}
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <BaseButton
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </BaseButton>
                    <BaseButton
                        onClick={handleConfirm}
                        isLoading={isSubmitting}
                        leftIcon="Truck"
                    >
                        Confirmar Envío
                    </BaseButton>
                </div>
            </div>
        </BaseModal>
    );
}
