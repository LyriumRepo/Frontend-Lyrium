'use client';

import React, { useState, useEffect } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Skeleton from '@/components/ui/Skeleton';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, ShieldAlert } from 'lucide-react';

interface ReviewsPageClientProps {
    // TODO Tarea 3
}

export function ReviewsPageClient(_props: ReviewsPageClientProps) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-8 animate-fadeIn font-industrial">
            <ModuleHeader
                title="Gestión de Puntuación"
                subtitle="Sistema de Reputación, Reseñas y Moderación de Calidad"
                icon="Star"
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <Skeleton className="h-6 w-1/2 rounded" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={`skeleton-${i}`} className="h-20 w-full rounded-2xl" />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <Skeleton className="h-6 w-1/2 rounded" />
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-3xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Vendedores Top Rank
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Tech Store', score: 4.9, reviews: 1250 },
                                { name: 'Legal Solutions', score: 4.8, reviews: 840 },
                                { name: 'Clima Fix', score: 4.7, reviews: 320 }
                            ].map((sel) => (
                                <div key={sel.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase">{sel.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold">{sel.reviews} verifiaciones</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-black text-gray-900">{sel.score}</span>
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-500" /> Reseñas Reportadas (Moderación)
                        </h3>
                        <div className="space-y-4">
                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(s => <Star key={s} className="w-3 h-3 text-rose-500 fill-rose-500" />)}
                                    </div>
                                    <span className="text-[9px] font-black text-rose-600 uppercase">Reportado</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700 leading-relaxed italic mb-4">El producto llegó tarde y el vendedor no responde los mensajes...</p>
                                <div className="flex gap-2">
                                    <BaseButton variant="danger" size="sm">Eliminar</BaseButton>
                                    <BaseButton variant="primary" size="sm">Ignorar</BaseButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
