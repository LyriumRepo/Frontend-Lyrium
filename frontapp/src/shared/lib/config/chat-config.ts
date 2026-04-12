/**
 * Configuración UI centralizada para módulos de chat y helpdesk
 * Usar estas constantes en TODOS los módulos
 */

export const CHAT_CONFIG = {
  sidebar: {
    width: 'w-80',
    widthMobile: 'w-full',
    maxWidth: 'max-w-sm',
  },
  layout: {
    height: 'h-[calc(100vh-12rem)]',
    minHeight: 'min-h-[600px]',
  },
  card: {
    rounded: 'rounded-2xl',
    shadow: 'shadow-lg',
    border: 'border-[var(--border-subtle)]',
    bg: 'bg-[var(--bg-card)]',
  },
  spacing: {
    gap: 'gap-4',
    padding: 'p-6',
  },
} as const;
