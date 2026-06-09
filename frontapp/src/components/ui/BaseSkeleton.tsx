import React from 'react';

interface BaseSkeletonProps {
  className?: string;
}

function BaseSkeleton({ className = '' }: BaseSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-secondary)]/70 rounded-2xl ${className}`}
    />
  );
}

export default BaseSkeleton;
export { BaseSkeleton };
