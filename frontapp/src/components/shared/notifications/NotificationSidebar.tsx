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

// Icono según el tipo de notificación (valor informativo), pero el color siempre
// sigue la paleta de marca (celeste en modo día, esmeralda en modo noche) — nada
// de rojo/naranja/ámbar, para no romper la unificación visual del resto de la app.
function getLevelUI(level: ProactiveNotification['level']) {
    const iconClass = 'w-4 h-4 text-sky-600 dark:text-emerald-400 flex-shrink-0';
    switch (level) {
        case 'CRITICAL':
            return { icon: <AlertTriangle className={iconClass} /> };
        case 'SECURITY':
            return { icon: <ShieldAlert className={iconClass} /> };
        case 'WARNING':
            return { icon: <Activity className={iconClass} /> };
        case 'INFO':
            return { icon: <Info className={iconClass} /> };
        default:
            return { icon: <Activity className={iconClass} /> };
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
                onKeyDown={(e) => { if (e.key === 'Escape') closeNotificationSidebar(); }}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
            />

            {/* Panel */}
            <aside className="fixed top-0 right-0 h-full w-[380px] max-w-[calc(100vw-2rem)] z-[61] bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-slideInRight">

                {/* Header */}
                <div className="relative flex items-center justify-between px-5 py-4 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Bell className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-white">
                                Notificaciones
                            </h2>
                            <p className="text-[10px] font-bold text-white/75 mt-0.5">
                                {filteredUnreadCount > 0 ? 'Tienes novedades pendientes' : 'Todo al día'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {filteredUnreadCount > 0 && (
                            <span className="bg-white text-sky-600 dark:text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {filteredUnreadCount > 9 ? '9+' : filteredUnreadCount}
                            </span>
                        )}
                        <button
                            onClick={closeNotificationSidebar}
                            className="p-1.5 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {filteredUnreadCount > 0 && (
                    <div className="flex justify-end px-5 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex-shrink-0">
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] font-black uppercase text-sky-600 dark:text-emerald-400 hover:bg-[var(--bg-muted)] px-2 py-1 rounded-lg transition-all"
                        >
                            Marcar todo leído
                        </button>
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto green-scrollbar">
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
                        <ul className="flex flex-col gap-2 p-3">
                            {filtered.map((n) => {
                                const ui = getLevelUI(n.level);
                                return (
                                    <li
                                        key={n.id}
                                        className={`flex gap-3 px-3.5 py-3 rounded-r-xl border-l-[3px] transition-colors ${
                                            !n.read
                                                ? 'border-sky-500 dark:border-emerald-500 bg-sky-500/5 dark:bg-emerald-500/10 hover:bg-sky-500/10 dark:hover:bg-emerald-500/15'
                                                : 'border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                                        } ${n.action ? 'cursor-pointer' : ''}`}
                                        onClick={() => n.action && handleClick(n)}
                                    >
                                        {/* Icon + content */}
                                        <div className="flex gap-3 flex-1 min-w-0">
                                            <div className="mt-0.5">{ui.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-xs font-black uppercase tracking-wide leading-tight ${!n.read ? 'text-sky-600 dark:text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
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
