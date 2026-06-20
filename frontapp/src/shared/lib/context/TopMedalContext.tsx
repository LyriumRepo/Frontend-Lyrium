'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

interface TopMedalMap {
    store: number[];
    product: number[];
    service: number[];
}

interface TopMedalContextValue {
    hasMedal: (entityType: 'store' | 'product' | 'service', entityId: number | string) => boolean;
    loading: boolean;
}

const TopMedalContext = createContext<TopMedalContextValue>({
    hasMedal: () => false,
    loading: true,
});

async function fetchActiveMedals(): Promise<TopMedalMap> {
    try {
        const res = await fetch(`${LARAVEL_API_URL}/medals/active`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return { store: [], product: [], service: [] };
        const json = await res.json();
        return json.data ?? { store: [], product: [], service: [] };
    } catch {
        return { store: [], product: [], service: [] };
    }
}

export function TopMedalProvider({ children }: { children: React.ReactNode }) {
    const [medalMap, setMedalMap] = useState<TopMedalMap>({ store: [], product: [], service: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchActiveMedals().then((data) => {
            if (mounted) {
                setMedalMap(data);
                setLoading(false);
            }
        });
        return () => { mounted = false; };
    }, []);

    const hasMedal = useCallback(
        (entityType: 'store' | 'product' | 'service', entityId: number | string): boolean => {
            const ids = medalMap[entityType] ?? [];
            return ids.includes(Number(entityId));
        },
        [medalMap],
    );

    return (
        <TopMedalContext.Provider value={{ hasMedal, loading }}>
            {children}
        </TopMedalContext.Provider>
    );
}

export function useTopMedal(): TopMedalContextValue {
    return useContext(TopMedalContext);
}

export function useHasMedal(entityType: 'store' | 'product' | 'service', entityId: number | string): boolean {
    const { hasMedal } = useTopMedal();
    return hasMedal(entityType, entityId);
}
