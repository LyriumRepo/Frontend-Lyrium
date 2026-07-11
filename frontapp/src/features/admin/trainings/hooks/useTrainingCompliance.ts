'use client';

import { useState, useEffect, useCallback } from 'react';
import { trainingApi } from '@/shared/lib/api/trainingRepository';
import type { SellerTrainingProgress, TrainingComplianceMeta } from '@/shared/lib/api/trainingRepository';

export function useTrainingCompliance() {
    const [data, setData] = useState<SellerTrainingProgress[]>([]);
    const [meta, setMeta] = useState<TrainingComplianceMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await trainingApi.getTrainingCompliance();
            setData(res.data ?? []);
            setMeta(res.meta ?? null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar progreso');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { data, meta, loading, error, reload: load };
}
