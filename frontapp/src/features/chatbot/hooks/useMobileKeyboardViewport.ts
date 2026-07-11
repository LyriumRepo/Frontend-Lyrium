'use client';

import { useEffect, useState } from 'react';

interface MobileViewport {
    top: number;
    height: number;
}

/**
 * En iOS Safari el teclado no reduce `100vh`/`dvh`, así que un panel `fixed`
 * con altura en vh se queda con el tamaño de "antes del teclado" y el input
 * queda tapado. Este hook usa `window.visualViewport` para conocer el alto
 * realmente visible y reposicionar el panel en mobile (<640px).
 * Devuelve `null` en desktop/tablet o si el navegador no soporta la API.
 */
export function useMobileKeyboardViewport(): MobileViewport | null {
    const [viewport, setViewport] = useState<MobileViewport | null>(null);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const update = () => {
            if (window.innerWidth >= 640) {
                setViewport(null);
                return;
            }
            // El teclado achica visualViewport.height respecto al alto de la
            // ventana; solo reposicionamos el panel cuando eso pasa de verdad.
            const keyboardOpen = vv.height < window.innerHeight * 0.75;
            setViewport(keyboardOpen ? { top: vv.offsetTop, height: vv.height } : null);
        };

        update();
        vv.addEventListener('resize', update);
        vv.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        return () => {
            vv.removeEventListener('resize', update);
            vv.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    return viewport;
}
