'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface ModalsPortalProps {
    children: React.ReactNode;
}

export default function ModalsPortal({ children }: ModalsPortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
        // Fallback to body if modal-root doesn't exist
        return createPortal(children, document.body);
    }

    return createPortal(children, modalRoot);
}
