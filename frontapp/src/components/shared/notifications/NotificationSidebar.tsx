'use client';

import { useRouter } from 'next/navigation';
import { Bell, AlertTriangle, ShieldAlert, Activity, Info, Check, Mail, X } from 'lucide-react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { ProactiveNotification } from '@/shared/types/notifications';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useUIStore } from '@/store/uiStore';
import { apiClient } from '@/lib/api/apiClient';
import { isAllowedForRole } from '@/shared/lib/notifications/roleNotificationTypes';
import { resolveNotificationRoute } from '@/shared/lib/notifications/resolveNotificationRoute';

function getLevelUI(level: ProactiveNotification['level']) {
    switch (level) {
        case 'CRITICAL':
            return { dot: 'bg-red-500', icon: <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />, text: 'text-red-500' };
        case 'SECURITY':
            return { dot: 'bg-orange-500', icon: <ShieldAlert className="w-4 h-4 text-orange-500 flex-shrink-0" />, text: 'text-orange-500' };
        case 'WARNING':
            return { dot: 'bg-amber-500', icon: <Activity className="w-4 h-4 text-amber-500 flex-shrink-0" />, text: 'text-amber-500' };
        case 'INFO':
            return { dot: 'bg-sky-500 dark:bg-emerald-500', icon: <Info className="w-4 h-4 text-sky-500 dark:text-emerald-400 flex-shrink-0" />, text: 'text-sky-600 dark:text-emerald-400' };
        default:
            return { dot: 'bg-[var(--text-secondary)]', icon: <Activity className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />, text: 'text-[var(--text-secondary)]' };
    }
}

export default function NotificationSidebar() {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const { user } = useAuth();
    const { notificationSidebarOpen, closeNotificationSidebar } = useUIStore();
    const router = useRouter();

    const filtered = notifications.filter(n =>
        isAllowedForRole(n.metadata?.type ?? '', user?.role, 'bell')
    );
    const filteredUnreadCount = filtered.filter(n => !n.read).length;

    const handleClick = (n: ProactiveNotification) => {
        if (!n.read) markAsRead(n.id);
        if (n.action) {
            const route = resolveNotificationRoute(n.action.type, n.action.id, user?.role);
            router.push(route);
        }
        closeNotificationSidebar();
    };

    const handleSecondaryAction = async (n: ProactiveNotification) => {
        if (n.secondaryAction?.type === 'resend_email' && n.secondaryAction.id) {
            try {
                await apiClient(`/orders/${n.secondaryAction.id}/resend-notification`, { method: 'POST' });
                const btn = document.getElementById(`ns-email-${n.id}`);
                if (btn) { btn.textContent = '✓ Enviado'; btn.className = 'text-[10px] font-black text-emerald-600'; }
            } catch {
                const btn = document.getElementById(`ns-email-${n.id}`);
                if (btn) { btn.textContent = '✗ Error'; btn.className = 'text-[10px] font-black text-rose-600'; }
            }
        }
    };

    if (!notificationSidebarOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
                onClick={closeNotificationSidebar}
            />

            {/* Panel */}
            <aside className="fixed top-0 right-0 h-full w-[380px] max-w-[calc(100vw-2rem)] z-[61] bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-slideInRight">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
                            <Bell className="w-4 h-4 text-sky-500 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">
                                Notificaciones
                            </h2>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5">
                                {filteredUnreadCount > 0 ? `${filteredUnreadCount} sin leer` : 'Todo al día'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {filteredUnreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-black uppercase text-sky-600 dark:text-emerald-400 hover:bg-[var(--bg-muted)] px-2 py-1 rounded-lg transition-all"
                            >
                                Marcar todo leído
                            </button>
                        )}
                        <button
                            onClick={closeNotificationSidebar}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-[var(--text-secondary)] opacity-40" />
                            </div>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">Sin notificaciones</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">
                                Las notificaciones de las últimas 24h aparecerán aquí
                            </p>
                        </div>
                    ) : (
                        <>
                        <ul className="divide-y divide-[var(--border-subtle)]">
                            {filtered.map((n) => {
                                const ui = getLevelUI(n.level);
                                return (
                                    <li
                                        key={n.id}
                                        className={`flex gap-3 px-5 py-4 transition-colors hover:bg-[var(--bg-secondary)] ${!n.read ? 'bg-[var(--bg-secondary)]/40' : ''} ${n.action ? 'cursor-pointer' : ''}`}
                                        onClick={() => n.action && handleClick(n)}
                                    >
                                        {/* Level dot */}
                                        <div className="flex-shrink-0 pt-1.5">
                                            <span className={`block w-2 h-2 rounded-full ${!n.read ? ui.dot : 'bg-[var(--border-subtle)]'}`} />
                                        </div>

                                        {/* Icon + content */}
                                        <div className="flex gap-3 flex-1 min-w-0">
                                            <div className="mt-0.5">{ui.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-xs font-black uppercase tracking-wide leading-tight ${!n.read ? ui.text : 'text-[var(--text-secondary)]'}`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.read && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                            className="flex-shrink-0 p-1 text-[var(--text-secondary)] hover:text-sky-500 dark:hover:text-emerald-400 hover:bg-[var(--bg-muted)] rounded transition-colors"
                                                            title="Marcar leída"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {n.action && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleClick(n); }}
                                                            className="text-[10px] font-black text-sky-600 dark:text-emerald-400 hover:underline"
                                                        >
                                                            {n.action.label} →
                                                        </button>
                                                    )}
                                                    {n.secondaryAction && (
                                                        <button
                                                            id={`ns-email-${n.id}`}
                                                            onClick={(e) => { e.stopPropagation(); handleSecondaryAction(n); }}
                                                            className="text-[10px] font-black text-[var(--text-secondary)] hover:text-emerald-600 flex items-center gap-1"
                                                        >
                                                            <Mail className="w-3 h-3" />
                                                            {n.secondaryAction.label}
                                                        </button>
                                                    )}
                                                    <span className="text-[10px] text-[var(--text-secondary)] ml-auto">
                                                        {n.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}
