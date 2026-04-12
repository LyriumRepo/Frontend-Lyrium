'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { MenuItem, MegaCategoryData } from '@/data/menuData';
import MegaMenu from './MegaMenu';
import { useUIStore } from '@/store/uiStore';

// Map icon string identifiers from menuData to BaseIcon names
const iconNameMap: Record<string, string> = {
    'shopping-bag': 'ShoppingBag',
    'headset': 'Headset',
    'info': 'Info',
    'newspaper': 'Newspaper',
    'chats-circle': 'ChatCircle',
    'storefront': 'Storefront',
    'buildings': 'Buildings',
    'phone-call': 'PhoneCall',
};

interface DesktopNavProps {
    menuItems: MenuItem[];
    megaMenuData: Record<string, MegaCategoryData>;
}

export default function DesktopNav({ menuItems, megaMenuData }: DesktopNavProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [activeCategory, setActiveCategory] = useState<string>('Bebés y recién nacidos');
    const menuRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const { setActiveDropdown, activeDropdown } = useUIStore();

    useEffect(() => {
        if (activeDropdown === 'search') {
            setActiveMenu(null);
        }
    }, [activeDropdown]);

    const handleMenuEnter = (label: string, children?: MenuItem[]) => {
        setActiveMenu(label);
        setActiveDropdown('megaMenu');
        
        const firstCategory = children && children.length > 0 ? children[0].label : 'Bebés y recién nacidos';
        setActiveCategory(firstCategory);

        const trigger = menuRefs.current[label];
        if (trigger) {
            const rect = trigger.getBoundingClientRect();
            const top = Math.round(rect.bottom + 10);
            const left = Math.round(rect.left);
            setMenuPosition({ top, left });
        }
    };

    const handleMenuLeave = () => {
        setActiveMenu(null);
    };

    return (
        <div className="border-t border-gray-200 dark:border-[var(--border-subtle)]">
            <nav className="max-w-7xl mx-auto px-4 py-2 hidden lg:flex items-center justify-center gap-6 text-[13px] font-medium text-slate-700 dark:text-[var(--text-secondary)] tracking-tight">
                {menuItems.map((item) => {
                    const iconName = item.icon ? iconNameMap[item.icon] : null;

                    return (
                        <div key={item.label} className="relative">
                            {item.children ? (
                                <button
                                    ref={(el) => { menuRefs.current[item.label] = el; }}
                                    type="button"
                                    onMouseEnter={() => handleMenuEnter(item.label, item.children)}
                                    className={`flex items-center gap-1 hover:text-sky-500 dark:hover:text-[var(--color-success)] transition whitespace-nowrap ${activeMenu === item.label ? 'text-sky-500 dark:text-[var(--color-success)]' : ''
                                        }`}
                                >
                                    {iconName && <Icon name={iconName} className="text-[17px]" />}
                                    {item.label}
                                    <Icon name="ChevronDown" className="w-3 h-3" />
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-1 hover:text-sky-500 dark:hover:text-[var(--color-success)] transition whitespace-nowrap"
                                >
                                    {iconName && <Icon name={iconName} className="text-[17px]" />}
                                    {item.label}
                                </Link>
                            )}

                            {/* MEGA MENU */}
                            {item.children && activeMenu === item.label && (
                                <MegaMenu
                                    item={item}
                                    megaMenuData={megaMenuData}
                                    activeCategory={activeCategory}
                                    menuPosition={menuPosition}
                                    onCategoryHover={(cat) => setActiveCategory(cat)}
                                    onMouseEnter={() => handleMenuEnter(item.label)}
                                    onMouseLeave={handleMenuLeave}
                                />
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
