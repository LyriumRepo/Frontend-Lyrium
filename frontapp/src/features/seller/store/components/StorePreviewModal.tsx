'use client';

import React from 'react';
import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';

interface StorePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    layoutId: string;
}

export default function StorePreviewModal({ isOpen, onClose, layoutId }: StorePreviewModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Santuario Visual"
            subtitle={`Previsualización en tiempo real • Configuración: ${layoutId}`}
            size="full"
            accentColor="from-indigo-500 via-purple-500 to-pink-500"
        >
            <div className="flex-1 overflow-y-auto bg-[var(--bg-secondary)]/50 p-4 md:p-12 min-h-[600px]">
                <div className="max-w-6xl mx-auto bg-[var(--bg-card)] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden min-h-screen border border-[var(--border-subtle)] flex flex-col">
                    {/* Header Mock */}
                    <div className="h-20 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between px-10">
                        <div className="w-32 h-6 bg-[var(--bg-muted)] rounded-full animate-pulse"></div>
                        <div className="flex gap-6">
                            <div className="w-12 h-3 bg-[var(--bg-muted)] rounded-full animate-pulse"></div>
                            <div className="w-12 h-3 bg-[var(--bg-muted)] rounded-full animate-pulse"></div>
                            <div className="w-12 h-3 bg-[var(--bg-muted)] rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="p-12 text-center space-y-12">
                        {/* Banner Mock */}
                        <div className="w-full h-[400px] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)] rounded-[3rem] shadow-inner border border-[var(--border-subtle)] flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                            <div className="w-24 h-24 bg-[var(--bg-card)] rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 relative z-10">
                                <Icon name="Image" className="w-10 h-10 text-[var(--text-secondary)]" />
                            </div>
                            <h4 className="text-xl font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] relative z-10">Hero Vision {layoutId}</h4>
                            <div className="mt-6 flex gap-3 relative z-10">
                                <div className="w-24 h-1 bg-sky-500 rounded-full"></div>
                                <div className="w-8 h-1 bg-[var(--border-subtle)] rounded-full"></div>
                                <div className="w-8 h-1 bg-[var(--border-subtle)] rounded-full"></div>
                            </div>
                        </div>

                        {/* Inventory Mock */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between px-4">
                                <div className="h-6 w-48 bg-gray-100 rounded-xl animate-pulse"></div>
                                <div className="h-4 w-24 bg-gray-50 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                    <div key={`preview-product-${i}`} className="space-y-4 group">
                                        <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] shadow-sm border border-gray-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 relative flex items-center justify-center">
                                            <Icon name="Package" className="w-8 h-8 text-gray-100 opacity-50" />
                                        </div>
                                        <div className="space-y-2 px-2">
                                            <div className="h-3 w-full bg-gray-100 rounded-lg animate-pulse"></div>
                                            <div className="h-3 w-2/3 bg-gray-50 rounded-lg animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
