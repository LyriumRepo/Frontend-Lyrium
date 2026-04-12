'use client';

import React, { useId } from 'react';
import Icon from './Icon';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectFieldProps {
    label?: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export default function BaseSelectField({
    label,
    name,
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    error,
    disabled = false,
    required = false,
    className = ''
}: SelectFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    const selectId = useId();
    const errorId = `${selectId}-error`;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={selectId} className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 block">
                    {label}
                    {required && <span className="text-[var(--color-error)] ml-1" aria-hidden="true">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    aria-required={required}
                    className={`
                        w-full px-4 py-3 
                        bg-[var(--bg-secondary)] border-none rounded-2xl 
                        focus:ring-2 focus:ring-[var(--ring-focus)] 
                        transition-all font-bold text-[var(--text-primary)]
                        outline-none cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed
                        appearance-none
                        text-[10px] uppercase tracking-widest
                        ${error ? 'ring-2 ring-[var(--color-error)]/50' : ''}
                    `}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option 
                            key={option.value} 
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" aria-hidden="true">
                    <Icon name="ChevronDown" className="w-4 h-4" />
                </div>
            </div>
            {error && (
                <p id={errorId} className="text-[10px] font-black text-[var(--color-error)] ml-1" role="alert">{error}</p>
            )}
        </div>
    );
}
