'use client';

import { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { ProactiveNotification } from '@/shared/types/notifications';

interface Props {
    onClose: () => void;
}

function levelDotClass(level: ProactiveNotification['level']): string {
    switch (level) {
        case 'CRITICAL': return 'bg-red-500';
        case 'SECURITY': return 'bg-orange-500';
        case 'WARNING':  return 'bg-amber-500';
        case 'INFO':     return 'bg-blue-500';
        default:         return 'bg-[var(--text-secondary)]';
    }
}

export default function NotificationAllModal({ onClose }: Props) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                <div className="relative bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-lg max-h-[80vh] flex flex-col pointer-events-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                <Bell className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">
                                    Todas las notificaciones
                                </h2>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5">
                                    {notifications.length === 0
                                        ? 'Sin notificaciones'
                                        : `${notifications.length} notificacion${notifications.length !== 1 ? 'es' : ''}${unreadCount > 0 ? ` · ${unreadCount} sin leer` : ''}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-black uppercase tracking-wider text-indigo-500 hover:text-indigo-700 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 transition-colors"
                                >
                                    Marcar todo leído
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                aria-label="Cerrar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                                    <Bell className="w-6 h-6 text-[var(--text-secondary)] opacity-40" />
                                </div>
                                <p className="text-sm font-bold text-[var(--text-secondary)]">
                                    Sin notificaciones
                                </p>
                                <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
                                    Cuando recibas notificaciones aparecerán aquí
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[var(--border-subtle)]">
                                {notifications.map((n) => (
                                    <li
                                        key={n.id}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && !n.read && markAsRead(n.id)}
                                        className={`flex gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] ${!n.read ? 'bg-[var(--bg-secondary)]/50' : ''}`}
                                        onClick={() => { if (!n.read) markAsRead(n.id); }}
                                    >
                                        {/* Unread dot */}
                                        <div className="flex-shrink-0 pt-1.5">
                                            <span
                                                className={`block w-2 h-2 rounded-full transition-colors ${!n.read ? levelDotClass(n.level) : 'bg-[var(--border-subtle)]'}`}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold leading-snug ${!n.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                {n.title}
                                            </p>
                                            {n.message && (
                                                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                                                    {n.message}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 opacity-60 font-medium">
                                                {n.time}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
