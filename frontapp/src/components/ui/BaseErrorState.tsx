'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';

interface BaseErrorStateProps {
  title: string;
  message: string;
  icon?: string;
  onRetry?: () => void;
}

export default function BaseErrorState({
  title,
  message,
  icon = 'AlertCircle',
  onRetry,
}: BaseErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center mb-5 shadow-inner">
        <Icon name={icon} className="w-10 h-10 text-rose-500" />
      </div>
      <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <BaseButton variant="primary" size="sm" onClick={onRetry}>
          Reintentar
        </BaseButton>
      )}
    </div>
  );
}
