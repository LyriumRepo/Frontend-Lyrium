import React from 'react';
import Icon from './Icon';

interface ErrorStateProps {
    title: string;
    message: string;
    icon?: string;
    onRetry?: () => void;
}

export default function BaseErrorState({
    title,
    message,
    icon = 'AlertCircle',
    onRetry
}: ErrorStateProps) {
    return (
        <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl p-20 border border-rose-100 dark:border-rose-900/50 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 dark:text-rose-400 mb-2">
                <Icon name={icon} className="w-10 h-10" />
            </div>
            <h3 className="text-gray-900 dark:text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">{title}</h3>
            <p className="text-gray-400 dark:text-[var(--text-secondary)] font-medium text-sm max-w-md">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-8 py-3 bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 dark:hover:bg-sky-500 transition-all active:scale-95"
                >
                    Reintentar
                </button>
            )}
        </div>
    );
}
