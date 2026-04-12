'use client';

import React from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';

interface PolaroidCardProps {
    image: string;
    rotation: string;
    onDelete: () => void;
}

export default function PolaroidCard({ image, rotation, onDelete }: PolaroidCardProps) {
    return (
        <div className={`relative group w-28 scale-95 hover:scale-100 hover:z-10 transition-all duration-300 ${rotation}`}>
            <div className="bg-[var(--bg-card)] p-2 pb-6 shadow-xl border border-[var(--border-subtle)] rounded-sm">
                <div className="aspect-square overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <Image src={image} fill sizes="112px" alt="Gallery" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
            </div>

            <button
                onClick={onDelete}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
                <Icon name="Trash2" className="w-3 h-3" />
            </button>

            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 dark:bg-black/40 backdrop-blur-sm -rotate-2 border border-white/20 dark:border-white/10"></div>
        </div>
    );
}
