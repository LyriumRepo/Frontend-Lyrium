import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-[var(--bg-card)] border-t border-gray-200 dark:border-[var(--border-subtle)] mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        © {currentYear} MarketPlace. Todos los derechos reservados.
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            href="/terminoscondiciones"
                            className="text-sm text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-[var(--text-primary)]"
                        >
                            Términos
                        </Link>
                        <Link
                            href="/politicasdeprivacidad"
                            className="text-sm text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-[var(--text-primary)]"
                        >
                            Privacidad
                        </Link>
                        <Link
                            href="/support"
                            className="text-sm text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-[var(--text-primary)]"
                        >
                            Soporte
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
