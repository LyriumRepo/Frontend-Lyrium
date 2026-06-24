import React from 'react';
import Icon from '@/components/ui/Icon';

export type ServiceFlowType = 'domicilio' | 'sede';

interface Step {
    id: number;
    label: string;
    icon: string;
}

interface ServiceOrderStepperProps {
    currentStep: number;
    flowType: ServiceFlowType;
}

const SERVICE_FLOW_CONFIG: Record<ServiceFlowType, { label: string; icon: string; color: string; steps: Step[] }> = {
    domicilio: {
        label: 'Atención a Domicilio',
        icon: 'Home',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        steps: [
            { id: 1, label: 'Validado por centro de salud', icon: 'CheckSquare' },
            { id: 2, label: 'En camino', icon: 'Truck' },
            { id: 3, label: 'Confirmación del paciente', icon: 'UserCheck' },
        ],
    },
    sede: {
        label: 'Atención en Sede',
        icon: 'Building2',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        steps: [
            { id: 1, label: 'Validado por centro de salud', icon: 'CheckSquare' },
            { id: 2, label: 'Confirmación del paciente', icon: 'UserCheck' },
        ],
    },
};

function getServiceImage(flowType: ServiceFlowType, stepId: number): string {
    if (stepId === 1) return '6.png';
    if (flowType === 'sede') return '8.png';
    return stepId === 2 ? '7.png' : '8.png';
}

export default function ServiceOrderStepper({ currentStep, flowType }: ServiceOrderStepperProps) {
    const { label, icon, color, steps } = SERVICE_FLOW_CONFIG[flowType];
    const progress = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${color}`}>
                    <Icon name={icon} className="w-3 h-3" />
                    {label}
                </span>
            </div>

            <div className="flex justify-between items-center relative mb-12 pb-5">
                <div className="absolute top-[21px] left-[5%] right-[5%] h-[3px] bg-[var(--bg-secondary)] rounded-full z-0">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-in-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;

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
                                            ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 scale-110'
                                            : 'border-gray-200 dark:border-[var(--border-subtle)] opacity-60'
                                    }`}
                            >
                                <img
                                    src={`/imagenes-seguimiento/${getServiceImage(flowType, step.id)}`}
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
