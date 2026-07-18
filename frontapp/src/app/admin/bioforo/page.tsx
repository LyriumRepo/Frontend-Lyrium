'use client';

import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { MessagesSquare } from 'lucide-react';

export default function BioForoAdminPage() {
    return (
        <div className="px-4 sm:px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
            <ModuleHeader
                title="BioForo"
                subtitle="Gestión del foro de la comunidad"
                icon="MessagesSquare"
            />
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                    <MessagesSquare className="w-8 h-8 text-[var(--text-secondary)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    Módulo en construcción
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                    El administrador del BioForo estará disponible próximamente.
                </p>
            </div>
        </div>
    );
}
