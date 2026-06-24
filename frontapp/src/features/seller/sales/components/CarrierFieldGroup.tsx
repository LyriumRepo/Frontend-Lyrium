'use client';

import React from 'react';
import { CarrierField } from '@/features/seller/sales/config/logistics';
import Icon from '@/components/ui/Icon';

interface CarrierFieldGroupProps {
    fields: CarrierField[];
    values: Record<string, string>;
    errors: Record<string, string>;
    onChange: (key: string, value: string) => void;
    disabled?: boolean;
}

export default function CarrierFieldGroup({
    fields,
    values,
    errors,
    onChange,
    disabled = false,
}: CarrierFieldGroupProps) {
    if (fields.length === 0) return null;

    return (
        <div className="space-y-5">
            {fields.map((field) => (
                <div key={field.key}>
                    <label
                        htmlFor={`carrier-${field.key}`}
                        className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block"
                    >
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <div className="relative">
                        <input
                            id={`carrier-${field.key}`}
                            type={field.type}
                            value={values[field.key] ?? ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                            disabled={disabled}
                            className={`
                                w-full px-4 py-3 rounded-xl text-sm font-bold
                                border-2 bg-[var(--bg-card)]
                                transition-all duration-200
                                placeholder:text-[var(--text-muted)] placeholder:font-medium
                                focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                                ${errors[field.key]
                                    ? 'border-red-300 bg-red-50/50 text-red-700'
                                    : 'border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-emerald-300'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            placeholder={field.label}
                            autoComplete={field.type === 'password' ? 'off' : 'on'}
                        />
                        {errors[field.key] && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <Icon name="AlertCircle" className="w-3 h-3 text-red-400" />
                                <span className="text-[10px] font-bold text-red-400">{errors[field.key]}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
