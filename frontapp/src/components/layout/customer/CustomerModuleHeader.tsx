import React from 'react';
import Icon from '@/components/ui/Icon';

/**
 * ModuleHeader exclusivo del panel cliente.
 *
 * MOBILE (< md):
 *   - Bloque 1: fondo blanco, FULL WIDTH, esquinas planas (el outer rounded-2xl
 *     hace la curvatura), título + subtítulo con salto de línea en vez de truncate.
 *   - Bloque 2: fondo del gradiente (heredado del outer), acciones FULL WIDTH.
 *   - `shrink-0` en el outer → nunca se comprime dentro de flex-col con altura fija
 *     (soluciona el corte en Chat/Soporte donde el parent es h-[calc(100dvh-108px)]).
 *
 * DESKTOP (≥ md):
 *   - Layout de 1 fila, mismo visual que el ModuleHeader original.
 *   - Bloque blanco: usa `lateral-gradient-mask` para la curva derecha (solo desde md).
 *   - Acciones: flex-none → nunca comprimidas por un título largo.
 */

interface CustomerModuleHeaderProps {
    title: React.ReactNode;
    subtitle: string;
    icon?: string;
    gradient?: string;
    height?: string;
    children?: React.ReactNode;
    actions?: React.ReactNode;
}

export default function CustomerModuleHeader({
    title,
    subtitle,
    icon,
    gradient = 'bg-brand-gradient',
    height = '6rem',
    children,
    actions,
}: CustomerModuleHeaderProps) {
    const hasActions = actions != null || children != null;

    return (
        <div
            className={`
                shrink-0
                ${gradient}
                rounded-2xl overflow-hidden
                shadow-sm border border-[var(--border-subtle)]
                mb-6 md:mb-8
                group transition-all duration-300 hover:shadow-md
            `}
        >
            <div
                className="flex flex-col md:flex-row md:items-stretch md:h-[var(--module-header-h)]"
                style={{ '--module-header-h': height } as React.CSSProperties}
            >
                {/* ── Bloque blanco (título) ───────────────────────────────
                 *  Mobile: fondo blanco puro sin border-radius propio
                 *          (las esquinas las da el outer rounded-2xl + overflow-hidden)
                 *  Desktop: usa lateral-gradient-mask → curva derecha + sombra
                 */}
                <div className="
                    bg-white dark:bg-[var(--bg-card)]
                    transition-all duration-500
                    md:lateral-gradient-mask md:rounded-r-[3.5rem]
                    px-5 py-4
                    md:pl-8 md:pr-20 md:py-0
                    flex flex-col justify-center
                    w-full md:w-fit md:flex-none
                    z-10
                ">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {icon && (
                            <div className="
                                w-8 h-8 md:w-10 md:h-10 rounded-xl shrink-0
                                bg-[var(--bg-secondary)]
                                flex items-center justify-center
                                text-[var(--text-secondary)]
                                group-hover:bg-[var(--celeste-500)]/10
                                group-hover:text-[var(--celeste-500)]
                                transition-all duration-500
                            ">
                                <Icon name={icon} className="w-4 h-4 md:w-5 md:h-5 !stroke-[2.5px]" />
                            </div>
                        )}
                        {/* Título: wrap en mobile, truncate solo en desktop */}
                        <h1 className="text-lg md:text-3xl font-black tracking-tight leading-tight break-words md:truncate text-[var(--text-primary)]">
                            {title}
                        </h1>
                    </div>
                    {/* Subtítulo: hasta 2 líneas en mobile, truncate en desktop */}
                    <p className="text-[var(--text-secondary)] text-xs md:text-sm font-medium mt-1 line-clamp-2 md:truncate">
                        {subtitle}
                    </p>
                </div>

                {/* ── Bloque de acciones (sobre el gradiente) ─────────────
                 *  Mobile: fila completa debajo del blanco, w-full garantizado
                 *  Desktop: flex-none → toma solo el espacio que necesita
                 */}
                {hasActions && (
                    <div className="
                        w-full md:w-auto md:flex-none md:ml-auto
                        flex items-center
                        justify-start md:justify-end
                        flex-wrap gap-2 md:gap-3
                        px-5 py-3 md:py-0 md:px-8
                        relative
                    ">
                        <div className="absolute inset-0 bg-white/10 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-20 flex items-center flex-wrap gap-2 md:gap-3">
                            {actions}
                            {children}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
