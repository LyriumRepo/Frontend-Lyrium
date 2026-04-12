import React, { useEffect, useState, useRef } from 'react';
import Icon from '@/components/ui/Icon';

interface ChatOptionsMenuProps {
    onClear: () => void;
    onDelete: () => void;
}

export default function ChatOptionsMenu({ onClear, onDelete }: ChatOptionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--bg-hover)] transition-all active:scale-90"
            >
                <Icon name="MoreVertical" className="font-bold w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem] shadow-2xl shadow-[var(--border-subtle)]/50 overflow-hidden z-50 animate-fadeInUp">
                    <button
                        onClick={() => { onClear(); setIsOpen(false); }}
                        className="w-full text-left p-4 hover:bg-[var(--bg-secondary)] flex items-center gap-3 transition-colors"
                    >
                        <Icon name="Trash2" className="text-[var(--text-secondary)] text-lg w-5 h-5" />
                        <span className="text-xs font-black text-[var(--text-primary)] uppercaseiar Historial tracking-tight">Vac</span>
                    </button>
                    <button
                        onClick={() => { if (confirm('¿Eliminar ticket permanentemente?')) { onDelete(); setIsOpen(false); } }}
                        className="w-full text-left p-4 hover:bg-[var(--bg-danger)] flex items-center gap-3 border-t border-[var(--border-subtle)] transition-colors"
                    >
                        <Icon name="AlertOctagon" className="text-[var(--text-danger)] text-lg w-5 h-5" />
                        <span className="text-xs font-black text-[var(--text-danger)] uppercase tracking-tight">Cerrar y Eliminar</span>
                    </button>
                </div>
            )}
        </div>
    );
}
