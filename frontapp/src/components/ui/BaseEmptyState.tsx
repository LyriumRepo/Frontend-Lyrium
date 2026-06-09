'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';

interface BaseEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  suggestion?: string;
}

export default function BaseEmptyState({
  icon = 'Package',
  title,
  description,
  actionLabel,
  onAction,
  suggestion,
}: BaseEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-inner">
        <Icon name={icon} className="w-10 h-10 text-[var(--text-secondary)]" />
      </div>
      <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <BaseButton variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </BaseButton>
      )}
      {suggestion && (
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-6 max-w-xs">
          {suggestion}
        </p>
      )}
    </div>
  );
}
