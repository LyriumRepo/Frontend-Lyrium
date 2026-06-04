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
                                className={`w-[42px] h-[42px] bg-[var(--bg-card)] border-[4px] rounded-[15px] flex items-center justify-center transition-all duration-300 font-black shadow-sm
                                    ${isCompleted
                                        ? 'border-emerald-500 text-emerald-500'
                                        : isActive
                                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -translate-y-1'
                                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                <Icon name={step.icon} className="text-lg" />
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
