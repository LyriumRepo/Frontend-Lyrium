'use client';

import React from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function ToggleSwitch({ enabled, onChange, size = 'md' }: ToggleSwitchProps) {
    const width = size === 'sm' ? 'w-12' : size === 'lg' ? 'w-16' : 'w-14';
    const height = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-7';
    const knobSize = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-6 w-6';
    const translateX = size === 'sm' ? 'translate-x-6' : size === 'lg' ? 'translate-x-8' : 'translate-x-7';
    const labelSize = size === 'sm' ? 'text-[8px]' : 'text-[10px]';

    return (
        <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={enabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            {/* Track */}
            <div className={`
                ${width} ${height} 
                bg-[var(--bg-secondary)] peer-focus:outline-none rounded-full 
                peer-checked:bg-sky-500 transition-all duration-300
            `}></div>

            {/* Knob */}
            <div className={`
                absolute top-[2px] left-[2px] bg-[var(--bg-card)] border-[var(--border-subtle)] border rounded-full 
                ${knobSize} transition-all duration-300
                ${enabled ? translateX : ''}
                peer-checked:border-white shadow-sm z-20
            `}></div>

            {/* ON Label - visible cuando enabled */}
            <span className={`
                absolute left-1.5 top-1/2 -translate-y-1/2 ${labelSize} font-black text-white 
                transition-opacity duration-300 z-30
                ${enabled ? 'opacity-100' : 'opacity-0'}
            `}>ON</span>

            {/* OFF Label - visible cuando NO enabled */}
            <span className={`
                absolute right-1.5 top-1/2 -translate-y-1/2 ${labelSize} font-black text-[var(--text-secondary)] 
                transition-opacity duration-300 z-30
                ${enabled ? 'opacity-0' : 'opacity-100'}
            `}>OFF</span>
        </label>
    );
}
