'use client';

import Icon from '@/components/ui/Icon';

interface Props {
    onMinimize?: () => void;
    onClose?: () => void;
    onClear?: () => void;
}

export default function ChatBotHeader({ onMinimize, onClose, onClear }: Props) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 dark:bg-emerald-400 rounded-full border-2 border-emerald-700 dark:border-[var(--brand-green)]" />
                </div>
                <div>
                    <p className="text-sm font-semibold leading-tight">Asistente Lyli</p>
                    <p className="text-[10px] text-emerald-100 dark:text-green-200 leading-tight font-medium tracking-wide uppercase">Soporte en línea</p>
                </div>
            </div>

            <div className="flex items-center gap-0.5">
                {onClear && (
                    <button
                        onClick={onClear}
                        className="p-1.5 rounded-lg hover:bg-white/20 active:bg-white/30 transition-colors"
                        title="Limpiar historial"
                    >
                        <Icon name="Trash2" className="text-sm" />
                    </button>
                )}
                {onMinimize && (
                    <button
                        onClick={onMinimize}
                        className="p-1.5 rounded-lg hover:bg-white/20 active:bg-white/30 transition-colors"
                        title="Minimizar"
                    >
                        <Icon name="Minus" className="text-sm" />
                    </button>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/20 active:bg-white/30 transition-colors"
                        title="Cerrar"
                    >
                        <Icon name="X" className="text-sm" />
                    </button>
                )}
            </div>
        </div>
    );
}
