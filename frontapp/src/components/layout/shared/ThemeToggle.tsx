'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-3 rounded-xl">
                <Image
                    src="/img/iconologo.png"
                    alt="Modo Bio"
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                />
            </div>
        );
    }

    const cycleTheme = () => {
        if (resolvedTheme === 'dark') {
            setTheme('light'); // Bio
        } else {
            setTheme('dark'); // Serenidad
        }
    };

    const getImage = () => {
        if (resolvedTheme === 'dark') {
            return {
                src: '/img/Flor_Dark.png',
                alt: 'Modo Serenidad'
            };
        }

        return {
            src: '/img/iconologo.png',
            alt: 'Modo Bio'
        };
    };

    const getLabel = () => {
        if (resolvedTheme === 'dark') return 'Modo Serenidad';
        return 'Modo Bio';
    };

    const image = getImage();

    return (
        <div className="relative group inline-block">
            <button
                onClick={cycleTheme}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors"
                aria-label={getLabel()}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    width={30}
                    height={30}
                    className="w-9 h-9 object-contain"
                />
            </button>

            <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-[#333333] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none"
            >
                {getLabel()}
            </span>
        </div>
    );
}