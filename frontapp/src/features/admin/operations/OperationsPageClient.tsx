'use client';

import { useGestionOperativa } from '@/features/admin/operations/hooks/useGestionOperativa';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import BaseModal from '@/components/ui/BaseModal';
import { GestionOperativaModule } from '@/components/admin/operations/GestionOperativaModule';
import { ProviderModal, TwoFactorModalContent } from '@/components/admin/operations/OperationsModals';
import { Provider } from '@/lib/types/admin/operations';

interface OperationsPageClientProps { }
export function OperationsPageClient(_props: OperationsPageClientProps) {
    const { state, actions } = useGestionOperativa();
    const { selectedProvider, show2FAModal } = state;

    const handleSaveProvider = (providerData: Partial<Provider>) => {
        actions.request2FA(() => { actions.saveProvider(providerData); });
    };

    return (
        <div className="space-y-6 animate-fadeIn font-industrial">
            <ModuleHeader title="Gestión Operativa" subtitle="Control de proveedores, gastos y credenciales" icon="Briefcase" actions={<div className="flex gap-2"><BaseButton onClick={() => alert('Generando Reporte...')} variant="primary" leftIcon="FileText" size="md">Reporte Mensual</BaseButton></div>} />
            <GestionOperativaModule state={state} actions={actions} />
            
            <BaseModal
                isOpen={!!selectedProvider}
                onClose={() => actions.setSelectedProvider(null)}
                title="Proveedor"
                subtitle="Gestión de proveedor operativo"
                size="2xl"
            >
                <ProviderModal 
                    provider={selectedProvider || null} 
                    onClose={() => actions.setSelectedProvider(null)} 
                    onSave={handleSaveProvider} 
                />
            </BaseModal>

            <BaseModal
                isOpen={show2FAModal}
                onClose={() => actions.close2FAModal()}
                title="Verificación de Seguridad"
                subtitle="Autenticación de dos factores"
                size="sm"
            >
                <TwoFactorModalContent 
                    onVerify={actions.verify2FA}
                    onClose={() => actions.close2FAModal()}
                />
            </BaseModal>
        </div>
    );
}
