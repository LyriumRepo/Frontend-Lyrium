'use client';

import Icon from '@/components/ui/Icon';

interface Props {
    onMinimize?: () => void;
    onClose?: () => void;
    onClear?: () => void;
}

export default function ChatBotHeader({ onMinimize, onClose, onClear }: Props) {
    return (
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-semibold leading-tight">Asistente Lyrium</p>
                    <p className="text-[10px] text-sky-100 leading-tight">Soporte en línea</p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {onClear && (
                    <button
                        onClick={onClear}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        title="Limpiar historial"
                    >
                        <Icon name="Trash2" className="text-sm" />
                    </button>
                )}
                {onMinimize && (
                    <button
                        onClick={onMinimize}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        title="Minimizar"
                    >
                        <Icon name="Minus" className="text-sm" />
                    </button>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        title="Cerrar"
                    >
                        <Icon name="X" className="text-sm" />
                    </button>
                )}
            </div>
        </div>
    );
}
