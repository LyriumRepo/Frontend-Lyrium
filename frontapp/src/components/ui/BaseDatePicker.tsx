'use client';

import React from 'react';

interface BaseDatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function BaseDatePicker({ value, onChange, placeholder, className = '' }: BaseDatePickerProps) {
    return (
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`text-xs bg-transparent border-none focus:ring-0 text-white placeholder-white/50 cursor-pointer ${className}`}
        />
    );
}
