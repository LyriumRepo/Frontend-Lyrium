import React from 'react';
import Icon from '@/components/ui/Icon';
import { TipoEnvio } from '@/features/seller/sales/types';

interface Step {
    id: number;
    label: string;
    icon: string;
}

interface OrderStepperProps {
    currentStep: number;
    tipoEnvio: TipoEnvio | null | undefined;
}

const FLOW_CONFIG: Record<TipoEnvio, { label: string; icon: string; color: string; steps: Step[] }> = {
    domicilio: {
        label: 'Entrega a Domicilio',
        icon: 'Home',
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
        steps: [
            { id: 1, label: 'Validado por vendedor',      icon: 'CheckSquare' },
            { id: 2, label: 'Despachado',    icon: 'Package'     },
            { id: 3, label: 'En Transporte', icon: 'Truck'       },
            { id: 4, label: 'En Domicilio',  icon: 'Home'        },
            { id: 5, label: 'Confirmado por cliente',    icon: 'UserCheck'   },
        ],
    },
    agencia: {
        label: 'Recojo en Agencia',
        icon: 'ScanBarcode',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        steps: [
            { id: 1, label: 'Validado por vendedor',      icon: 'CheckSquare' },
            { id: 2, label: 'Despachado',    icon: 'Package'     },
            { id: 3, label: 'En Transporte', icon: 'Truck'       },
            { id: 9, label: 'Listo en Agencia', icon: 'ScanBarcode' },
            { id: 5, label: 'Confirmado por cliente',    icon: 'UserCheck'   },
        ],
    },
};

export default function ProductOrderStepper({ currentStep, tipoEnvio }: OrderStepperProps) {
    const config = FLOW_CONFIG[tipoEnvio ?? 'domicilio'] ?? FLOW_CONFIG['domicilio'];
    const { label, icon, color, steps } = config;
    const progress = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

    return (
        <div className="space-y-6">
            {/* Título del flujo */}
            <div className="flex items-center justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${color}`}>
                    <Icon name={icon} className="w-3 h-3" />
                    {label}
                </span>
            </div>

            {/* Pasos */}
            <div className="flex justify-between items-center relative mb-12 pb-5">
                {/* Progress line */}
                <div className="absolute top-[21px] left-[5%] right-[5%] h-[3px] bg-[var(--bg-secondary)] rounded-full z-0">
                    <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-1000 ease-in-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive    = step.id === currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center relative z-10"
                            style={{ width: `${100 / steps.length}%` }}
                        >
                            <div
                                className={`w-14 h-14 rounded-full border-[3px] overflow-hidden transition-all duration-700 shadow-sm flex-shrink-0 bg-white dark:bg-[var(--bg-card)] flex items-center justify-center
                                    ${isCompleted
                                        ? 'border-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/30'
                                        : isActive
                                            ? 'border-sky-500 dark:border-[var(--brand-green)] shadow-lg shadow-sky-500/20 dark:shadow-lime-500/20 scale-110'
                                            : 'border-gray-200 dark:border-[var(--border-subtle)] opacity-60'
                                    }`}
                            >
                                <img
                                    src={`/imagenes-seguimiento/${step.id}.png`}
                                    alt={`Paso ${step.id}`}
                                    className="w-[90%] h-[90%] rounded-full object-cover"
                                />
                            </div>
                            <span
                                className={`mt-3 text-[8px] font-black uppercase tracking-wider text-center leading-tight transition-colors
                                    ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}