'use client';

import { useSellerStore } from '@/features/seller/store/hooks/useSellerStore';
import type { PlanCapabilities } from '@/features/seller/store/types';

export function usePlanCapabilities() {
    const { config, loading } = useSellerStore();

    const capabilities: PlanCapabilities | undefined = config?.plan_capabilities;
    const planName = config?.subscription?.plan?.name ?? 'Sin Plan';
    const planSlug = config?.subscription?.plan?.slug ?? '';
    const isExpired = config?.subscription?.status === 'expired';
    const capabilitiesLoading = loading && !capabilities;

    const isUnlimited = (value: number | undefined): boolean => value === -1 || value === undefined;

    const can = (feature: string): boolean => {
        if (capabilitiesLoading) return false;
        if (!capabilities) return false;
        const val = capabilities[feature];
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val > 0 || val === -1;
        return false;
    };

    const limit = (resource: string): number => {
        if (capabilitiesLoading) return 0;
        if (!capabilities) return 0;
        const val = capabilities[resource];
        if (typeof val === 'number') return val;
        return 0;
    };

    const exceeds = (resource: string, current: number): boolean => {
        const max = limit(resource);
        if (isUnlimited(max)) return false;
        return current >= max;
    };

    const available = (resource: string, current: number): number => {
        const max = limit(resource);
        if (isUnlimited(max)) return -1;
        return Math.max(0, max - current);
    };

    const stickerTypes: string[] = Array.isArray(capabilities?.sticker_types)
        ? (capabilities!.sticker_types as string[])
        : [];

    return {
        capabilities,
        capabilitiesLoading,
        planName,
        planSlug,
        isExpired,
        can,
        limit,
        exceeds,
        available,
        isUnlimited,
        stickerTypes,
    };
}
