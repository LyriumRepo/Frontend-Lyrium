'use client';

import type { BookingStatus } from '@/shared/lib/api/bookingRepository';
import {
  SERVICE_FLOW_STEPS,
  getServiceStepImage,
  serviceStatusToStep,
  type ServiceFlowType,
} from '@/shared/lib/booking/serviceFlowSteps';
import { TrackingStepper } from '@/shared/components/tracking/TrackingStepper';

// Mirrors ServiceOrderStepper.tsx (seller's Mis Ventas/Reservas) — same step count,
// same status -> step mapping (via serviceStatusToStep), and now the same
// TrackingStepper visual (check-badge, pulsing ring, gradient bar) as Mis Pedidos,
// so the customer sees the exact same current step and animation as the seller.
export function BookingTimeline({
  status,
  isHome,
  validated = false,
}: {
  status: BookingStatus;
  isHome: boolean;
  /** True cuando el cliente ya validó la finalización — pinta el último paso como completado. */
  validated?: boolean;
}) {
  if (status === 'cancelled' || status === 'no_show') {
    return (
      <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center">
        <p className="text-sm font-bold text-red-700 dark:text-red-300">
          {status === 'cancelled' ? '❌ Reserva cancelada' : '⚠️ Cliente no asistió'}
        </p>
      </div>
    );
  }

  const flowType: ServiceFlowType = isHome ? 'domicilio' : 'sede';
  const currentStep = serviceStatusToStep(status);
  const steps = SERVICE_FLOW_STEPS[flowType].map((step) => ({
    key: step.id,
    label: step.customerLabel,
    image: getServiceStepImage(flowType, step.id),
  }));

  return <TrackingStepper steps={steps} currentStep={currentStep} validated={validated} />;
}
