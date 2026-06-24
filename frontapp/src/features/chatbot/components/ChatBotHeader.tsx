'use client';

import Icon from '@/components/ui/Icon';
import LogoLyrium from '@/components/LogoLyrium';

interface Props {
    onMinimize?: () => void;
    onClose?: () => void;
    onClear?: () => void;
}

export default function ChatBotHeader({ onMinimize, onClose, onClear }: Props) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
                <LogoLyrium size="sm" showText={false} frontImg="/img/iconologo.png" />
                <div>
                    <p className="text-sm font-semibold leading-tight">Asistente Lyrio</p>
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
