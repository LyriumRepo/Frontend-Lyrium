'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ThemeToggleProps {
    buttonClassName?: string;
    imageClassName?: string;
}

export default function ThemeToggle({
    buttonClassName = 'p-3 rounded-xl',
    imageClassName = 'w-9 h-9 object-contain',
}: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={buttonClassName}>
                <span className={`relative block ${imageClassName}`}>
                    <Image
                        src="/img/iconologo.png"
                        alt="Modo Bio"
                        fill
                        sizes="48px"
                        className="object-contain"
                    />
                </span>
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
        // Antes usaba /img/Flor_Dark.png en modo oscuro: es un dibujo de solo
        // líneas finas sobre fondo transparente, ilegible a tamaño de ícono
        // pequeño (se pierde por el antialiasing). iconologo.png tiene relleno
        // sólido de color y se ve bien en cualquier fondo y tamaño.
        if (resolvedTheme === 'dark') {
            return {
                src: '/img/iconologo.png',
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
                className={`${buttonClassName} hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors`}
                aria-label={getLabel()}
            >
                <span className={`relative block ${imageClassName}`}>
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="48px"
                        className="object-contain"
                    />
                </span>
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