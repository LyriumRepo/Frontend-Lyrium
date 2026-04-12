'use client';

import type { UserType } from '../types/auth';

interface UserTypeToggleProps {
    value: UserType;
    onChange: (type: UserType) => void;
}

export function UserTypeToggle({ value, onChange }: UserTypeToggleProps) {
    return (
        <div className="flex justify-center mb-6">
            <div className="bg-slate-100 dark:bg-[var(--bg-primary)] p-1 rounded-full flex">
                <button
                    type="button"
                    onClick={() => onChange('vendedor')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        value === 'vendedor'
                            ? 'bg-sky-500 text-white shadow-md'
                            : 'text-slate-600 dark:text-[var(--text-secondary)] hover:text-sky-500'
                    }`}
                >
                    Soy vendedor
                </button>
                <button
                    type="button"
                    onClick={() => onChange('cliente')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        value === 'cliente'
                            ? 'bg-sky-500 text-white shadow-md'
                            : 'text-slate-600 dark:text-[var(--text-secondary)] hover:text-sky-500'
                    }`}
                >
                    Soy cliente
                </button>
            </div>
        </div>
    );
}
