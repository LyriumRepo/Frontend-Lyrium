'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface PlanUpgradeModalProps {
    open: boolean;
    onClose: () => void;
    featureName?: string;
    requiredPlan?: string;
}

export default function PlanUpgradeModal({ open, onClose, featureName, requiredPlan }: PlanUpgradeModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[var(--bg-card)] rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl border border-[var(--border-subtle)] animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Lock" className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-black text-[var(--text-primary)]">Funcionalidad Premium</h3>
                    {featureName && (
                        <p className="text-sm text-[var(--text-secondary)] mt-2">
                            <span className="font-bold">{featureName}</span> está disponible en{' '}
                            <span className="font-black text-amber-500">{requiredPlan ?? 'un plan superior'}</span>
                            {' '}o superior.
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <a
                        href="/seller/planes"
                        className="block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest text-center hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                        Ver Planes Disponibles
                    </a>
                    <button
                        onClick={onClose}
                        className="block w-full px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-bold text-xs uppercase tracking-widest text-center hover:bg-[var(--border-subtle)] transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
