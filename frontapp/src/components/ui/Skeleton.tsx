import React from 'react';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-secondary)]/70 rounded-2xl ${className}`}
    />
  );
}

interface SkeletonRowProps {
  count?: number;
  className?: string;
}

function SkeletonRow({ count = 1, className = '' }: SkeletonRowProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-[var(--bg-secondary)]/70 rounded-2xl h-12 mb-3 ${className}`}
        />
      ))}
    </>
  );
}

export default Skeleton;
export { SkeletonRow };
