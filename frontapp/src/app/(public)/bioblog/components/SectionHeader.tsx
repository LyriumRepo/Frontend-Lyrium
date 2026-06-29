'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
    label: string;
    title: string;
    description?: string;
    align?: 'center' | 'left';
}

export default function SectionHeader({ label, title, description, align = 'center' }: SectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`pt-16 pb-10 ${align === 'center' ? 'text-center' : 'text-left'} max-w-5xl mx-auto px-4`}
        >
            <div className={`flex items-center space-x-3 mb-4 ${align === 'center' ? 'justify-center' : ''}`}>
                <span className="h-px w-12 bg-lime-500" />
                <span className="text-lime-600 dark:text-lime-400 font-bold tracking-widest text-sm uppercase">
                    {label}
                </span>
                <span className="h-px w-12 bg-lime-500" />
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-4 drop-shadow-sm uppercase tracking-tight">
                {title}
            </h3>
            {description && (
                <p className="text-slate-600 dark:text-[var(--text-muted)] text-base md:text-lg leading-relaxed font-light max-w-3xl mx-auto">
                    {description}
                </p>
            )}
        </motion.div>
    );
}
