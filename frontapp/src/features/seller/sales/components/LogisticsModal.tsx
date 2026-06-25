'use client';

import React, { useState, useMemo } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import CarrierFieldGroup from './CarrierFieldGroup';
import { CARRIERS, CARRIER_CODES, CarrierConfig, CarrierField } from '@/features/seller/sales/config/logistics';
import type { TipoEnvio } from '@/features/seller/sales/types';
import Icon from '@/components/ui/Icon';

interface LogisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (carrierCode: string, carrierData: Record<string, string>) => Promise<void>;
    /** Modo automático: carrier ya detectado desde la orden/shipment */
    detectedCarrier?: string | null;
    /** Datos existentes para edición (re-apertura del modal) */
    existingData?: Record<string, string> | null;
    tipoEnvio: TipoEnvio;
}

export default function LogisticsModal({
    isOpen,
    onClose,
    onConfirm,
    detectedCarrier,
    existingData,
    tipoEnvio,
}: LogisticsModalProps) {
    const [selectedCarrier, setSelectedCarrier] = useState<string>(
        () => detectedCarrier ?? existingData?.carrier_code ?? CARRIER_CODES[0]
    );
    const [formValues, setFormValues] = useState<Record<string, string>>(
        () => existingData ?? {}
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAuto = !!detectedCarrier;
    const activeCarrier: CarrierConfig | undefined = CARRIERS[selectedCarrier?.toLowerCase()];
    const filteredFields = useMemo(() => {
        if (!activeCarrier) return [];
        if (tipoEnvio === 'domicilio') {
            return activeCarrier.fields.filter(f => f.key === 'tracking_code');
        }
        return activeCarrier.fields;
    }, [activeCarrier, tipoEnvio]);

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
        if (!isAuto) {
            if (!formValues.tracking_code?.trim()) {
                newErrors.tracking_code = 'El código de seguimiento es obligatorio';
            }
        } else {
            if (!activeCarrier) {
                newErrors._form = 'Operador logístico no detectado';
                setErrors(newErrors);
                return false;
            }
            for (const field of filteredFields) {
                const fieldDef = field as CarrierField;
                if (fieldDef.required && !formValues[fieldDef.key]?.trim()) {
                    newErrors[fieldDef.key] = `${fieldDef.label} es obligatorio`;
                }
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
            await onConfirm(selectedCarrier.toLowerCase(), { ...formValues });
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

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Datos del Operador Logístico"
            subtitle={isAuto
                ? `Operador detectado: ${activeCarrier?.name ?? detectedCarrier}`
                : 'Completa los datos de seguimiento para este envío'
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

                {!isAuto ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-200">
                            <Icon name="Info" className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-sky-700 leading-relaxed">
                                El operador logístico es asignado por <strong>Lyrium</strong>. Ingresa el número de seguimiento cuando esté disponible.
                            </p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                                Código de Seguimiento
                            </label>
                            <input
                                type="text"
                                value={formValues.tracking_code ?? ''}
                                onChange={(e) => handleFieldChange('tracking_code', e.target.value)}
                                placeholder="Ej: 123456789"
                                disabled={isSubmitting}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                            />
                            {errors.tracking_code && (
                                <p className="text-xs font-bold text-red-500 mt-1">{errors.tracking_code}</p>
                            )}
                        </div>
                    </div>
                ) : activeCarrier && (
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-2xl border border-[var(--border-subtle)]">
                        <CarrierFieldGroup
                            fields={filteredFields}
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
