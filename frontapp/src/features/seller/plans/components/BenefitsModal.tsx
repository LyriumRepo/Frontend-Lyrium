'use client';

import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';
import type { Plan, DetailedBenefit } from '../types';

interface BenefitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan | null;
}

export default function BenefitsModal({ isOpen, onClose, plan }: BenefitsModalProps) {
    if (!plan) return null;

    const benefits: DetailedBenefit[] = plan.detailedBenefits || [];

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Beneficios del ${plan.name}`}
            subtitle="Conoce a detalle cada beneficio incluido"
            size="lg"
            accentColor={plan.cssColor}
        >
            <div className="space-y-4">
                {benefits.length > 0 ? (
                    benefits.map((benefit) => (
                        <div 
                            key={benefit.title}
                            className="flex gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl"
                        >
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                style={{ backgroundColor: `${benefit.color}20` }}
                            >
                                {benefit.emoji}
                            </div>
                            <div className="flex-1">
                                <h4 
                                    className="font-semibold text-[var(--text-primary)]"
                                    style={{ color: benefit.color }}
                                >
                                    {benefit.title}
                                </h4>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                        <Icon name="Info" className="w-12 h-12 mx-auto mb-3 text-[var(--text-secondary)]" />
                        <p>No hay beneficios detallados disponibles para este plan.</p>
                    </div>
                )}
            </div>
        </BaseModal>
    );
}
