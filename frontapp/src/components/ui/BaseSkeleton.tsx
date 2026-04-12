import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export default function BaseSkeleton({ className = '', variant = 'rect' }: SkeletonProps) {
    const baseClasses = "animate-pulse bg-[var(--bg-muted)]";

    const variantClasses = {
        text: "h-3 w-3/4 rounded-md",
        rect: "rounded-2xl",
        circle: "rounded-full"
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
    );
}

export const SkeletonCard = ({ count = 1 }: { count?: number }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                    <BaseSkeleton variant="circle" className="w-12 h-12" />
                    <div className="flex-1 space-y-2">
                        <BaseSkeleton variant="text" className="w-1/2 h-4" />
                        <BaseSkeleton variant="text" className="w-1/4 h-3" />
                    </div>
                </div>
                <BaseSkeleton variant="rect" className="w-full h-32" />
                <div className="flex gap-2">
                    <BaseSkeleton variant="rect" className="flex-1 h-10 rounded-xl" />
                    <BaseSkeleton variant="rect" className="flex-1 h-10 rounded-xl" />
                </div>
            </div>
        ))}
    </>
);

export const SkeletonRow = ({ count = 5 }: { count?: number }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0">
                <BaseSkeleton variant="circle" className="w-10 h-10 shrink-0" />
                <div className="flex-1 space-y-2">
                    <BaseSkeleton variant="text" className="w-1/3 h-4" />
                    <BaseSkeleton variant="text" className="w-1/4 h-3" />
                </div>
                <BaseSkeleton variant="rect" className="w-20 h-6 shrink-0" />
                <BaseSkeleton variant="rect" className="w-10 h-10 shrink-0" />
            </div>
        ))}
    </>
);
