import React from 'react';
import Icon from '@/components/ui/Icon';

interface Step {
    id: number;
    label: string;
    icon: string;
}

interface OrderStepperProps {
    currentStep: number;
}

const STEPS: Step[] = [
    { id: 1, label: 'Validación', icon: 'CheckSquare' },
    { id: 2, label: 'Despacho', icon: 'Package' },
    { id: 3, label: 'Recojo / Agencia', icon: 'ScanBarcode' },
    { id: 4, label: 'En Tránsito', icon: 'Truck' },
    { id: 5, label: 'Validación Comprador', icon: 'UserCheck' }
];

export default function OrderStepper({ currentStep }: OrderStepperProps) {
    const progress = Math.max(0, Math.min(100, ((currentStep - 1) / (STEPS.length - 1)) * 100));

    return (
        <div className="flex justify-between items-center relative mb-12 pb-5">
            {/* Progress Line background */}
            <div className="absolute top-[21px] left-[5%] right-[5%] h-[3px] bg-[var(--bg-secondary)] rounded-full z-0">
                <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-1000 ease-in-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {STEPS.map((step) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;

                return (
                    <div key={step.id} className="flex flex-col items-center w-[18%] relative z-10">
                        <div
                            className={`w-[42px] h-[42px] bg-[var(--bg-card)] border-[4px] rounded-[15px] flex items-center justify-center transition-all duration-300 font-black shadow-sm
                                ${isCompleted ? 'border-emerald-500 text-emerald-500' :
                                    isActive ? 'border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/20 -translate-y-1' :
                                        'border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}
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
    );
}
