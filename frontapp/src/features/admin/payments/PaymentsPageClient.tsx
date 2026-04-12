'use client';

import { useTreasury } from '@/features/admin/treasury/hooks/useTreasury';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseModal from '@/components/ui/BaseModal';
import { TreasuryModule } from '@/components/admin/treasury/TreasuryModule';
import { PaymentModal } from '@/components/admin/treasury/TreasuryModals';

interface PaymentsPageClientProps { }
export function PaymentsPageClient(_props: PaymentsPageClientProps) {
    const { state, actions } = useTreasury();
    const { selectedPayment } = state;

    return (
        <div className="space-y-6 animate-fadeIn font-industrial">
            <ModuleHeader title="Módulo de Gestión de Pagos" subtitle="Control de Cash-In, Liquidaciones y Vouchers (RF-14, RF-15)" icon="CreditCard" />
            <TreasuryModule state={state} actions={actions} />
            
            <BaseModal
                isOpen={!!selectedPayment}
                onClose={() => actions.setSelectedPayment(null)}
                title="Detalle de Pago"
                subtitle="Información transaccional"
                size="2xl"
            >
                {selectedPayment && (
                    <PaymentModal 
                        payment={selectedPayment} 
                        onClose={() => actions.setSelectedPayment(null)} 
                        onProcessIn={actions.validateCashIn} 
                        onProcessOut={actions.processCashOut} 
                    />
                )}
            </BaseModal>
        </div>
    );
}
