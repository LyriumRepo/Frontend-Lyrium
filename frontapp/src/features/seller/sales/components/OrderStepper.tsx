import React from 'react';
import { TipoEnvio } from '@/features/seller/sales/types';

interface Step {
    id: number;
    label: string;
}

interface OrderStepperProps {
    currentStep: number;
    tipoEnvio: TipoEnvio | null | undefined;
}

const FLOW_STEPS: Record<TipoEnvio, Step[]> = {
    domicilio: [
        { id: 1, label: 'Validado'      },
        { id: 2, label: 'Despachado'    },
        { id: 3, label: 'En Transporte' },
        { id: 4, label: 'En Domicilio'  },
        { id: 5, label: 'Confirmado'    },
    ],
    agencia: [
        { id: 1, label: 'Validado'      },
        { id: 2, label: 'Despachado'    },
        { id: 3, label: 'En Transporte' },
        { id: 9, label: 'En Agencia'    },
        { id: 5, label: 'Confirmado'    },
    ],
    retiro_tienda: [
        { id: 1, label: 'Validado'         },
        { id: 2, label: 'Despacho'         },
        { id: 3, label: 'Listo en Tienda'  },
        { id: 4, label: 'Confirmado'       },
    ],
};

const RETIRO_STEP_REMAP: Record<number, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 3,
    5: 4,
};

export default function ProductOrderStepper({ currentStep, tipoEnvio }: OrderStepperProps) {
    const steps = FLOW_STEPS[tipoEnvio ?? 'domicilio'] ?? FLOW_STEPS['domicilio'];
    const displayStep = tipoEnvio === 'retiro_tienda'
        ? (RETIRO_STEP_REMAP[currentStep] ?? currentStep)
        : currentStep;
    const progress = Math.max(0, Math.min(100, ((displayStep - 1) / (steps.length - 1)) * 100));

    return (
        <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-3">
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    Seguimiento del Pedido
                </p>
            </div>

            {/* Stepper */}
            <div className="px-5 pb-6">
                <div className="flex justify-between items-start relative">
                    {/* Progress line */}
                    <div className="absolute top-[22px] left-[10%] right-[10%] h-[3px] bg-[var(--border-subtle)] rounded-full z-0">
                        <div
                            className="h-full bg-[var(--brand-green,#B7E000)] rounded-full transition-all duration-1000 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {steps.map((step) => {
                        const isCompleted = step.id < displayStep;
                        const isActive    = step.id === displayStep;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-col items-center relative z-10"
                                style={{ width: `${100 / steps.length}%` }}
                            >
                                <div
                                    className={`w-11 h-11 rounded-full border-[3px] overflow-hidden transition-all duration-700 flex-shrink-0
                                        ${isCompleted
                                            ? 'border-emerald-500'
                                            : isActive
                                                ? 'border-[var(--brand-green,#B7E000)] shadow-lg scale-110'
                                                : 'border-[var(--border-subtle)] opacity-40'
                                        }`}
                                >
                                    <img
                                        src={`/imagenes-seguimiento/${step.id}.png`}
                                        alt={step.label}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span
                                    className={`mt-2 text-[7px] font-black uppercase tracking-wider text-center leading-tight transition-colors
                                        ${isActive
                                            ? 'text-[var(--brand-green,#B7E000)]'
                                            : isCompleted
                                                ? 'text-emerald-500'
                                                : 'text-[var(--text-secondary)] opacity-60'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
