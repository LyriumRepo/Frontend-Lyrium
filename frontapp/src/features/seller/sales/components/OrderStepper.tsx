import React from 'react';
import { Store } from 'lucide-react';
import { TipoEnvio } from '@/features/seller/sales/types';
import { TrackingStepper } from '@/shared/components/tracking/TrackingStepper';

interface Step {
    id: number;
    label: string;
}

interface OrderStepperProps {
    currentStep: number;
    tipoEnvio: TipoEnvio | null | undefined;
    /** True cuando el cliente ya validó la recepción — pinta el último paso como completado. */
    validated?: boolean;
    /** Presente solo cuando el pedido incluye productos de otras tiendas. */
    isMultiStore?: boolean;
    /** Abre el modal con el detalle de qué tiendas ya confirmaron. */
    onShowStores?: () => void;
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
    // Los items de producto solo pasan por pending_seller→confirmed→processing→
    // shipped→delivered (nunca "on_the_way") — igual que domicilio, así que usa
    // los mismos 5 slots 1-5, solo con etiquetas/íconos propios de retiro.
    retiro_tienda: [
        { id: 1, label: 'Validado'           },
        { id: 2, label: 'Despachado'         },
        { id: 3, label: 'En Transporte'      },
        { id: 4, label: 'Listo en Sucursal'  },
        { id: 5, label: 'Confirmado'         },
    ],
};

export default function ProductOrderStepper({ currentStep, tipoEnvio, validated = false, isMultiStore = false, onShowStores }: OrderStepperProps) {
    const flowSteps = FLOW_STEPS[tipoEnvio ?? 'domicilio'] ?? FLOW_STEPS['domicilio'];

    // Retiro en tienda tiene su propio set de íconos (clipboard→tienda→camión→tienda+pin→persona),
    // distinto del genérico de domicilio/agencia (que usa una casa en el paso final).
    const steps = flowSteps.map((step, i) => ({
        key: step.id,
        label: step.label,
        image: tipoEnvio === 'retiro_tienda' ? `retiro-tienda-${i + 1}.png` : `${step.id}.png`,
    }));

    return (
        <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-2">
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    Seguimiento del Pedido
                </p>
                {isMultiStore && onShowStores && (
                    <button
                        type="button"
                        onClick={onShowStores}
                        title="Este pedido incluye productos de varias tiendas"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                    >
                        <Store className="w-3 h-3" /> Varias tiendas
                    </button>
                )}
            </div>

            <div className="px-5 pb-6">
                <TrackingStepper steps={steps} currentStep={currentStep} validated={validated} />
            </div>
        </div>
    );
}
