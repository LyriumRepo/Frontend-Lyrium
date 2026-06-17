'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, AlertTriangle, ShieldAlert, Activity, Check, Info, Mail } from 'lucide-react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { ProactiveNotification } from '@/shared/types/notifications';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { apiClient } from '@/lib/api/apiClient';
import NotificationAllModal from '@/components/shared/notifications/NotificationAllModal';
import { isAllowedForRole } from '@/shared/lib/notifications/roleNotificationTypes';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { user } = useAuth();
    const router = useRouter();

    const getPanelInfo = () => {
        switch (user?.role) {
            case 'administrator':
                return { title: 'Centro de Monitoreo', subtitle: 'Sistemas de Alerta Temprana', cta: 'Abrir Consola Forense de Eventos', redirect: '/admin/helpdesk' };
            case 'seller':
                return { title: 'Notificaciones de Mi Tienda', subtitle: 'Actualizaciones en tiempo real', cta: 'Ver todas mis notificaciones', redirect: '/seller/help' };
            case 'customer':
                return { title: 'Mis Notificaciones', subtitle: 'Actualizaciones de tus pedidos', cta: 'Ver todos mis pedidos', redirect: '/customer/orders' };
            case 'logistics_operator':
                return { title: 'Panel de Envíos', subtitle: 'Seguimiento de entregas', cta: 'Ir a Mis Envíos', redirect: '/logistics/shipments' };
            default:
                return { title: 'Notificaciones', subtitle: 'Centro de notificaciones', cta: 'Ver notificaciones', redirect: '/' };
        }
    };

    const resolveRoute = (actionType: string, actionId: string | number | undefined, role: string | undefined): string => {
        const prefix = role === 'administrator' ? '/admin'
            : role === 'seller' ? '/seller'
            : role === 'customer' ? '/customer'
            : role === 'logistics_operator' ? '/logistics'
            : '';

        switch (actionType) {
            case 'orders':
                return `${prefix}/orders`;
            case 'invoices':
                return `${prefix}/invoices`;
            case 'chat':
                return role === 'administrator' ? '/admin/helpdesk'
                    : `${prefix}/chat`;
            case 'ticket':
                return role === 'administrator' ? `/admin/helpdesk?id=${actionId}`
                    : role === 'seller' ? `/seller/help?id=${actionId}`
                    : `/customer/support?id=${actionId}`;
            case 'store':
                return role === 'administrator' ? '/admin/stores'
                    : role === 'seller' ? '/seller/settings'
                    : '/';
            default:
                return prefix || '/';
        }
    };

    const panelInfo = getPanelInfo();

    const filteredNotifications = notifications.filter(n =>
        isAllowedForRole(n.metadata?.type ?? '', user?.role, 'bell')
    );

    const getLevelUI = (level: ProactiveNotification['level']) => {
        switch (level) {
            case 'CRITICAL':
                return { color: 'bg-red-500/10 border-red-500/20 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-400', icon: <AlertTriangle className="w-5 h-5 text-red-500" /> };
            case 'SECURITY':
                return { color: 'bg-orange-500/10 border-orange-500/20 dark:bg-orange-900/20', text: 'text-orange-500 dark:text-orange-400', icon: <ShieldAlert className="w-5 h-5 text-orange-500" /> };
            case 'WARNING':
                return { color: 'bg-yellow-500/10 border-yellow-500/20 dark:bg-yellow-900/20', text: 'text-yellow-500 dark:text-yellow-400', icon: <Activity className="w-5 h-5 text-yellow-500" /> };
            case 'INFO':
                return { color: 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-900/20', text: 'text-blue-500 dark:text-blue-400', icon: <Info className="w-5 h-5 text-blue-500" /> };
            case 'OPERATIONAL':
            default:
                return { color: 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-900/20', text: 'text-blue-500 dark:text-blue-400', icon: <Activity className="w-5 h-5 text-blue-500" /> };
        }
    };

    const handleNotificationClick = (notification: ProactiveNotification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        
        if (notification.action) {
            const route = resolveRoute(notification.action.type, notification.action.id, user?.role);
            router.push(route);
        } else {
            router.push(panelInfo.redirect);
        }
        setIsOpen(false);
    };

    const handleSecondaryAction = async (notification: ProactiveNotification) => {
        if (notification.secondaryAction?.type === 'resend_email' && notification.secondaryAction.id) {
            try {
                await apiClient(`/orders/${notification.secondaryAction.id}/resend-notification`, {
                    method: 'POST',
                });
                const btn = document.getElementById(`email-sent-${notification.id}`);
                if (btn) {
                    btn.textContent = '✓ Enviado';
                    btn.className = 'text-[10px] font-black text-emerald-600';
                }
            } catch {
                const btn = document.getElementById(`email-sent-${notification.id}`);
                if (btn) {
                    btn.textContent = '✗ Error';
                    btn.className = 'text-[10px] font-black text-rose-600';
                }
            }
        }
    };

    const unreadFiltered = filteredNotifications.filter(n => !n.read).length;

    return (
        <div className="relative font-industrial">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${isOpen ? 'bg-indigo-500/10 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400' : 'text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--bg-muted)]'}`}
                aria-label="Centro de Notificaciones"
            >
                <Bell className="w-5 h-5" />
                {unreadFiltered > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)] animate-pulse">
                        {unreadFiltered > 9 ? '9+' : unreadFiltered}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Cerrar notificaciones"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsOpen(false)}
                        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-[400px] bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-[2rem] shadow-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] z-50 overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 dark:bg-[var(--bg-muted)]/80 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-widest text-[var(--text-primary)] dark:text-[var(--text-primary)]">{panelInfo.title}</h3>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] uppercase tracking-widest mt-1">{panelInfo.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadFiltered > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-900/30 px-2 py-1 rounded-lg transition-all"
                                    >
                                        Limpiar Todo
                                    </button>
                                )}
                                <span className="px-2 py-1 bg-[var(--bg-secondary)] dark:bg-[var(--bg-muted)] text-[var(--text-secondary)] text-[10px] font-black rounded-lg uppercase">{unreadFiltered} no leídas</span>
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {filteredNotifications.length === 0 ? (
                                <div className="p-8 text-center text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">
                                    No hay alertas activas
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {filteredNotifications.map((notification) => {
                                        const ui = getLevelUI(notification.level);
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`p-4 rounded-2xl border transition-all ${!notification.read ? ui.color : 'bg-[var(--bg-card)] border-transparent dark:border-[var(--border-subtle)] opacity-60'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {ui.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className={`font-black text-[11px] uppercase tracking-wide leading-tight ${ui.text} cursor-pointer`}
                                                               onClick={() => handleNotificationClick(notification)}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notification.id);
                                                                    }} 
                                                                    className="text-[var(--text-secondary)] hover:text-indigo-500 p-1 bg-[var(--bg-secondary)] rounded-md shadow-sm border border-[var(--border-subtle)] transition-colors" 
                                                                    title="Marcar leída"
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-snug cursor-pointer"
                                                           onClick={() => handleNotificationClick(notification)}>
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            {notification.action && (
                                                                <button
                                                                    onClick={() => handleNotificationClick(notification)}
                                                                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-lg transition-all hover:bg-indigo-100"
                                                                >
                                                                    {notification.action.label} →
                                                                </button>
                                                            )}
                                                            {notification.secondaryAction && (
                                                                <button
                                                                    id={`email-sent-${notification.id}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSecondaryAction(notification);
                                                                    }}
                                                                    className="text-[10px] font-black text-[var(--text-secondary)] hover:text-emerald-600 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                                                >
                                                                    <Mail className="w-3 h-3" />
                                                                    {notification.secondaryAction.label}
                                                                </button>
                                                            )}
                                                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                                                {notification.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 text-center">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowAll(true);
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                            >
                                Ver todas las notificaciones
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showAll && (
                <NotificationAllModal onClose={() => setShowAll(false)} />
            )}
        </div>
    );
}
