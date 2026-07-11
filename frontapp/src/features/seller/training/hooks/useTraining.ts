'use client';

import { useState, useEffect, useCallback } from 'react';
import { trainingApi } from '@/shared/lib/api/trainingRepository';
import type { SellerTraining, SellerTrainingStats } from '../types';

export function useTraining() {
    const [trainings, setTrainings] = useState<SellerTraining[]>([]);
    const [stats, setStats] = useState<SellerTrainingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [trainingsRes, statsRes] = await Promise.all([
                trainingApi.getSellerTrainings(),
                trainingApi.getSellerStats(),
            ]);
            setTrainings(trainingsRes.data ?? []);
            setStats(statsRes.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar capacitaciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const toggleComplete = async (training: SellerTraining) => {
        setTogglingId(training.id);
        try {
            if (training.completed) {
                await trainingApi.markIncomplete(training.id);
            } else {
                await trainingApi.markCompleted(training.id);
            }
            await load();
        } finally {
            setTogglingId(null);
        }
    };

    const groupedByCategory = trainings.reduce<Record<string, SellerTraining[]>>((acc, t) => {
        const cat = t.category ?? 'Sin categoría';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(t);
        return acc;
    }, {});

    const sortedCategories = Object.keys(groupedByCategory).sort();

    const completedCount = trainings.filter(t => t.completed).length;
    const totalCount = trainings.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
        trainings,
        stats,
        loading,
        error,
        togglingId,
        toggleComplete,
        groupedByCategory,
        sortedCategories,
        completedCount,
        totalCount,
        progressPercent,
        reload: load,
    };
}
