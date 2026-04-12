'use client';

import { useTheme } from 'next-themes';
import Icon from '@/components/ui/Icon';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showSystem, setShowSystem] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-2.5 rounded-xl">
                <Icon name="Sun" className="w-5 h-5 text-amber-500" />
            </div>
        );
    }

    const cycleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const getIcon = () => {
        if (theme === 'system') {
            return { name: 'Monitor', color: 'text-sky-400' as const };
        }
        if (resolvedTheme === 'dark') {
            return { name: 'Moon', color: 'text-sky-400' as const };
        }
        return { name: 'Sun', color: 'text-amber-500' as const };
    };

    const getLabel = () => {
        if (theme === 'system') return 'Modo automático';
        if (theme === 'dark') return 'Modo oscuro';
        return 'Modo claro';
    };

    const icon = getIcon();

    return (
        <div className="relative">
            <button
                onClick={cycleTheme}
                onMouseEnter={() => setShowSystem(true)}
                onMouseLeave={() => setShowSystem(false)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors"
                aria-label={getLabel()}
                title={getLabel()}
            >
                <Icon name={icon.name} className={`w-5 h-5 ${icon.color}`} />
            </button>
        </div>
    );
}
