'use client';

import React from 'react';
import Image from 'next/image';
import { useHasMedal } from '@/shared/lib/context/TopMedalContext';

interface TopMedalBadgeProps {
    entityType: 'store' | 'product' | 'service';
    entityId: number | string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    className?: string;
}

const sizeMap = {
    xs: { w: 17, h: 17, cls: 'w-[17px] h-[17px]' },
    sm: { w: 22, h: 22, cls: 'w-[22px] h-[22px]' },
    md: { w: 32, h: 32, cls: 'w-8 h-8' },
    lg: { w: 36, h: 36, cls: 'w-9 h-9' },
    xl: { w: 50, h: 50, cls: 'w-[50px] h-[50px]' },
    xxl: { w: 90, h: 90, cls: 'w-[90px] h-[90px]' },
};

export default function TopMedalBadge({ entityType, entityId, size = 'md', className = '' }: TopMedalBadgeProps) {
    const hasMedal = useHasMedal(entityType, entityId);

    if (!hasMedal) return null;

    const s = sizeMap[size];

    return (
        <div className={`${s.cls} ${className}`} title="Top 100 Lyrium">
            <Image
                src="/img/INSIGNIA PREMIUM.png"
                alt="Top 100"
                width={s.w}
                height={s.h}
                className="w-full h-full object-contain drop-shadow-md"
            />
        </div>
    );
}
