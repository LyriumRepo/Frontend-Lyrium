'use client';
import { useSearchParams } from 'next/navigation';
import type { UserType } from '../types/auth';

interface UserTypeToggleProps {
    value: UserType;
    onChange: (type: UserType) => void;
}

export function UserTypeToggle({ value, onChange }: UserTypeToggleProps) {
    const searchParams = useSearchParams();
const mode = searchParams.get('mode');

// Si viene de "REGISTRA TU TIENDA", no mostrar nada
if (mode === 'vendor') {
    return null;
}
return (
    <div className="flex justify-center mb-3 sm:mb-6">
        <div className="bg-slate-100 dark:bg-[var(--bg-primary)] p-1 rounded-full flex">
            <button
                type="button"
                onClick={() => onChange('vendedor')}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all ${
                    value === 'vendedor'
                        ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-md dark:hover:bg-[var(--brand-green-hover)]'
                        : 'text-slate-600 dark:text-[var(--text-secondary)] hover:text-sky-500 dark:hover:text-[var(--brand-green)]'
                }`}
            >
                Soy vendedor
            </button>

            <button
                type="button"
                onClick={() => onChange('cliente')}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all ${
                    value === 'cliente'
                        ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-md dark:hover:bg-[var(--brand-green-hover)]'
                        : 'text-slate-600 dark:text-[var(--text-secondary)] hover:text-sky-500 dark:hover:text-[var(--brand-green)]'
                }`}
            >
                Soy cliente
            </button>
        </div>
    </div>
);
}
