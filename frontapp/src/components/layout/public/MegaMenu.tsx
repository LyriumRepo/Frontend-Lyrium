'use client';

import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { MenuItem, MegaCategoryData } from '@/data/menuData';
import { useEffect, useRef, useState } from "react";

interface MegaMenuProps {
    item: MenuItem;
    megaMenuData: Record<string, MegaCategoryData>;
    activeCategory: string;
    menuPosition: { top: number; left: number };
    onCategoryHover: (category: string) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

function CategoryLabel({ label, active }: { label: string; active: boolean }) {
    const textRef = useRef<HTMLSpanElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const check = () => {
            setIsTruncated(el.scrollWidth > el.clientWidth);
        };

        check();
        window.addEventListener("resize", check);

        return () => window.removeEventListener("resize", check);
    }, [label]);

    return (
        <div className="relative group w-full min-w-0">
            <span
                ref={textRef}
                className={`block max-w-full truncate whitespace-nowrap text-left ${active
                    ? 'text-white'
                    : 'text-slate-700 dark:text-[var(--text-primary)]'
                    }`}
            >
                {label}
            </span>

            {/* Tooltip SOLO si hay truncado */}
            {isTruncated && (
                <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block">
                    <div className="bg-[#333333] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {label}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MegaMenu({
    item,
    megaMenuData,
    activeCategory,
    menuPosition,
    onCategoryHover,
    onMouseEnter,
    onMouseLeave,
}: MegaMenuProps) {
    const megaData = megaMenuData[activeCategory] || Object.values(megaMenuData)[0];
    const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});

    const circleColors = [
        'hover:text-[#B7E000]', // lima
        'hover:text-[#8FD400]', // verde
        'hover:text-[#66D6A8]', // turquesa claro
        'hover:text-[#4EC7B8]', // turquesa
        'hover:text-[#69BEEB]', // celeste
        'hover:text-[#5AAFE6]', // azul celeste
    ];
    const textHoverColors = [
        'group-hover:text-[#B7E000]',
        'group-hover:text-[#8FD400]',
        'group-hover:text-[#66D6A8]',
        'group-hover:text-[#4EC7B8]',
        'group-hover:text-[#69BEEB]',
        'group-hover:text-[#5AAFE6]',
    ];

    const toggleColumn = (key: string) => {
        setExpandedCols(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };
    console.log(megaData.icons);

    if (!item.children) return null;

    const bgColor =
        item.label?.toLowerCase() === 'servicios'
            ? 'bg-[#78e69d]'
            : 'bg-[#bde90d]';
    return (
        <div
            className="fixed left-0 w-full bg-white dark:bg-[var(--bg-secondary)] shadow-2xl dark:shadow-none border-t border-gray-200 dark:border-[var(--border-subtle)] opacity-100 pointer-events-auto transition-all duration-150 z-[99999]"
            style={{ top: `${menuPosition.top}px`, bottom: 0 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-0 h-full overflow-hidden">
                {/* LISTA DE CATEGORÍAS (IZQUIERDA) */}
                <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-gray-50 dark:bg-[var(--bg-muted)] border-r border-gray-200 dark:border-[var(--border-subtle)] p-3 overflow-y-auto h-full">

                    <ul className="mt-3 space-y-1 text-sm">
                        {item.children.map((child) => (
                            <li key={child.label}>
                                <button
                                    type="button"
                                    onMouseEnter={() => onCategoryHover(child.label)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeCategory === child.label
                                        ? `${bgColor} text-white shadow-sm`
                                        : 'hover:bg-[#bde90d] hover:text-white hover:shadow-sm'
                                        }`}
                                >
                                    <CategoryLabel
                                        label={child.label}
                                        active={activeCategory === child.label}
                                    />
                                    <Icon
                                        name="ChevronDown"
                                        className={`w-4 h-4 transition-transform ${activeCategory === child.label ? 'text-white rotate-90' : 'text-slate-400 dark:text-[var(--text-placeholder)]'
                                            }`}
                                    />
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* CONTENIDO DERECHO */}
                <section className="col-span-12 md:col-span-8 lg:col-span-9 p-5 overflow-y-auto h-full bg-white dark:bg-[var(--bg-secondary)]">
                    {/* ICONS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {megaData.icons?.slice(0, 6).map((icon, index) => (
                            <Link key={icon.title} href={icon.href} className="group text-center">
                                <div className={`mx-auto w-28 h-28 rounded-full border flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-[1.02] transition overflow-hidden ${circleColors[index % circleColors.length]}`}>
                                    <Image
                                        src={icon.img}
                                        alt={icon.title}
                                        width={112}
                                        height={112}
                                        className="w-full h-full object-contain scale-135"
                                    />
                                </div>
                                <div className={`mt-2 text-[12px] font-semibold text-slate-700 dark:text-[var(--text-primary)] transition ${textHoverColors[index % textHoverColors.length]}`}>
                                    {icon.title}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-5 h-px bg-lime-400/80"></div>

                    {/* COLUMNAS */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-sm">
                        {megaData.cols.map((col, colIdx) => (
                            <div key={`${col.h}-${colIdx}`}>
                                {(() => {
                                    const relatedIcon = megaData.icons.find(
                                        (icon) => icon.title.toUpperCase() === col.h
                                    );

                                    return (
                                        <Link
                                            href={relatedIcon?.href || '#'}
                                            className="text-[13px] font-extrabold tracking-wide text-slate-800 dark:text-[var(--text-primary)] uppercase mb-2 block hover:text-[#6BAF7B] transition"
                                        >
                                            {col.h}
                                        </Link>
                                    );
                                })()}
                                <ul className="space-y-1.5">

                                    {(expandedCols[col.h]
                                        ? col.items
                                        : col.items.slice(0, 3)
                                    ).map((it, itemIdx) => {

                                        const item =
                                            typeof it === 'string'
                                                ? { name: it, href: '#' }
                                                : it;

                                        return (
                                            <li key={`${item.name}-${colIdx}-${itemIdx}`}>
                                                <Link
                                                    href={item.href || '#'}
                                                    className="text-[12px] text-slate-500 dark:text-[var(--text-placeholder)] hover:text-[#6BAF7B] transition"
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}

                                    {col.items.length > 3 && (
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => toggleColumn(col.h)}
                                                className="flex items-center gap-1 text-[11px] font-semibold text-[#6BAF7B] hover:opacity-80 transition"
                                            >
                                                {expandedCols[col.h] ? 'Ver menos' : 'Ver más'}

                                                <svg
                                                    className={`w-3 h-3 transition-transform ${
                                                        expandedCols[col.h] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
