'use client';

import { motion } from 'framer-motion';

interface AnimatedWrapperProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function AnimatedWrapper({ children, className, delay = 0 }: AnimatedWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
