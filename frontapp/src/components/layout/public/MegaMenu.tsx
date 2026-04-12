'use client';

import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { MenuItem, MegaCategoryData } from '@/data/menuData';

interface MegaMenuProps {
    item: MenuItem;
    megaMenuData: Record<string, MegaCategoryData>;
    activeCategory: string;
    menuPosition: { top: number; left: number };
    onCategoryHover: (category: string) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
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

    if (!item.children) return null;

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
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-lime-500 text-white text-[13px] font-bold tracking-wide shadow-sm min-h-[48px]"
                    >
                        <span className="text-slate-800 dark:text-[var(--text-primary)]">{activeCategory}</span>
                        <Icon name="ChevronDown" className="w-4 h-4 text-slate-500 dark:text-[var(--text-placeholder)]" />
                    </button>
                    <ul className="mt-3 space-y-1 text-sm">
                        {item.children.map((child) => (
                            <li key={child.label}>
                                <button
                                    type="button"
                                    onMouseEnter={() => onCategoryHover(child.label)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeCategory === child.label
                                        ? 'bg-white dark:bg-[var(--bg-secondary)] shadow-sm'
                                        : 'hover:bg-white dark:hover:bg-[#111A15] hover:shadow-sm'
                                        }`}
                                >
                                    <span className="text-slate-700 dark:text-[var(--text-primary)]">{child.label}</span>
                                    <Icon
                                        name="ChevronDown"
                                        className={`w-4 h-4 text-slate-400 dark:text-[var(--text-placeholder)] ${activeCategory === child.label ? 'rotate-90' : ''
                                            } transition-transform`}
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
                        {megaData.icons.map((icon) => (
                            <Link key={icon.title} href={icon.href} className="group text-center">
                                <div className="mx-auto w-28 h-28 rounded-full bg-lime-500/20 border border-lime-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-[1.02] transition overflow-hidden">
                                    <Image
                                        src={icon.img}
                                        alt={icon.title}
                                        width={112}
                                        height={112}
                                        className="w-full h-full object-contain scale-135"
                                    />
                                </div>
                                <div className="mt-2 text-[12px] font-semibold text-slate-700 dark:text-[var(--text-primary)] group-hover:text-sky-600 dark:group-hover:text-[var(--color-success)] transition">
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
                                <div className="text-[13px] font-extrabold tracking-wide text-slate-800 dark:text-[var(--text-primary)] uppercase mb-2">
                                    {col.h}
                                </div>
                                <ul className="space-y-1.5">
                                    {col.items.map((it, itemIdx) => (
                                        <li key={`${it}-${colIdx}-${itemIdx}`}>
                                            <Link
                                                href="#"
                                                className="text-[12px] text-slate-500 dark:text-[var(--text-placeholder)] hover:text-sky-600 dark:hover:text-[#6BAF7B] transition"
                                            >
                                                {it}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
