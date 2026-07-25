// Single source of truth for the "service attention" step sequence, shared between the
// seller's ServiceOrderStepper (Mis Ventas / Reservas) and the customer's BookingTimeline
// (Mis Reservas). Both must render the exact same step count and the exact same
// status -> step mapping, or the two modules drift out of sync (seller shows one step,
// customer shows another for the same booking).
export type ServiceFlowType = 'domicilio' | 'sede';

export interface ServiceFlowStepDef {
    id: number;
    sellerLabel: string;
    customerLabel: string;
}

export const SERVICE_FLOW_STEPS: Record<ServiceFlowType, ServiceFlowStepDef[]> = {
    domicilio: [
        { id: 1, sellerLabel: 'Validado por centro de salud', customerLabel: 'Confirmada' },
        { id: 2, sellerLabel: 'En camino', customerLabel: 'En camino' },
        { id: 3, sellerLabel: 'Confirmación del paciente', customerLabel: 'Completada' },
    ],
    sede: [
        { id: 1, sellerLabel: 'Validado por centro de salud', customerLabel: 'Confirmada' },
        { id: 2, sellerLabel: 'Confirmación del paciente', customerLabel: 'Completada' },
    ],
};

export function getServiceStepImage(flowType: ServiceFlowType, stepId: number): string {
    if (stepId === 1) return '6.png';
    if (flowType === 'sede') return '8.png';
    return stepId === 2 ? '7.png' : '8.png';
}

/**
 * Maps a ServiceBooking status to a display step. 'pending' and 'confirmed' both map to
 * step 1 on purpose: validating a booking only *activates* the timeline, it does not
 * complete the first step — only the seller's next action (on_the_way/complete) does
 * that and moves the timeline forward. This mirrors LaravelOrderRepository's
 * SERVICE_STATUS_STEP_MAP so the seller's Mis Ventas stepper and this shared step
 * function never disagree on "what step are we on".
 */
export function serviceStatusToStep(status: string): number {
    switch (status) {
        case 'pending':
        case 'confirmed':
            return 1;
        case 'on_the_way':
            return 2;
        case 'completed':
            return 3;
        default:
            return 0; // cancelled, no_show, or unknown
    }
}
