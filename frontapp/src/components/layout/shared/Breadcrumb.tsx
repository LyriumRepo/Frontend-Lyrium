import Link from 'next/link';
import { BreadcrumbItem } from '@/lib/types/navigation';

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-2 text-sm">
            <Link
                href="/"
                className="text-gray-500 dark:text-[var(--text-secondary)] hover:text-gray-700 dark:hover:text-[var(--text-primary)]"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </Link>

            {items.map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400 dark:text-[var(--text-placeholder)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>

                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-gray-500 dark:text-[var(--text-secondary)] hover:text-gray-700 dark:hover:text-[var(--text-primary)]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 dark:text-[var(--text-primary)] font-medium">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
