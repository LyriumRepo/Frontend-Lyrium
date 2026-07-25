import React from 'react';
import Icon from '@/components/ui/Icon';
import { SERVICE_FLOW_STEPS, getServiceStepImage, type ServiceFlowType } from '@/shared/lib/booking/serviceFlowSteps';
import { TrackingStepper } from '@/shared/components/tracking/TrackingStepper';

export type { ServiceFlowType };

interface ServiceOrderStepperProps {
    currentStep: number;
    flowType: ServiceFlowType;
    /** True cuando el cliente ya validó la finalización — pinta el último paso como completado. */
    validated?: boolean;
}

const FLOW_BADGE: Record<ServiceFlowType, { label: string; icon: string; color: string }> = {
    domicilio: { label: 'Atención a Domicilio', icon: 'Home', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    sede: { label: 'Atención en Sede', icon: 'Building2', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
};

export default function ServiceOrderStepper({ currentStep, flowType, validated = false }: ServiceOrderStepperProps) {
    const { label, icon, color } = FLOW_BADGE[flowType];
    const steps = SERVICE_FLOW_STEPS[flowType].map((step) => ({
        key: step.id,
        label: step.sellerLabel,
        image: getServiceStepImage(flowType, step.id),
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${color}`}>
                    <Icon name={icon} className="w-3 h-3" />
                    {label}
                </span>
            </div>

            <TrackingStepper steps={steps} currentStep={currentStep} validated={validated} />
        </div>
    );
}
