'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, AlertTriangle, ShieldAlert, Activity, Check, Info } from 'lucide-react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { ProactiveNotification } from '@/shared/types/notifications';
import { useAuth } from '@/shared/lib/context/AuthContext';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { user } = useAuth();
    const router = useRouter();

    const getPanelInfo = () => {
        switch (user?.role) {
            case 'administrator':
                return { title: 'Centro de Monitoreo', subtitle: 'Sistemas de Alerta Temprana', cta: 'Abrir Consola Forense de Eventos', redirect: '/admin/helpdesk' };
            case 'seller':
                return { title: 'Notificaciones de Mi Tienda', subtitle: 'Actualizaciones en tiempo real', cta: 'Ver todas mis notificaciones', redirect: '/seller/help' };
            case 'logistics_operator':
                return { title: 'Panel de Envíos', subtitle: 'Seguimiento de entregas', cta: 'Ir a Mis Envíos', redirect: '/logistics/shipments' };
            default:
                return { title: 'Centro de Monitoreo', subtitle: 'Sistemas de Alerta Temprana', cta: 'Abrir Consola Forense de Eventos', redirect: '/admin/helpdesk' };
        }
    };

    const panelInfo = getPanelInfo();

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
        
        const basePath = user?.role === 'administrator' ? '/admin/helpdesk' : '/seller/help';
        router.push(basePath);
        setIsOpen(false);
    };

    return (
        <div className="relative font-industrial">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${isOpen ? 'bg-indigo-500/10 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400' : 'text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--bg-muted)]'}`}
                aria-label="Centro de Notificaciones"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)] animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
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
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-900/30 px-2 py-1 rounded-lg transition-all"
                                    >
                                        Limpiar Todo
                                    </button>
                                )}
                                <span className="px-2 py-1 bg-[var(--bg-secondary)] dark:bg-[var(--bg-muted)] text-[var(--text-secondary)] text-[10px] font-black rounded-lg uppercase">{unreadCount} no leídas</span>
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">
                                    No hay alertas activas
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {notifications.map((notification) => {
                                        const ui = getLevelUI(notification.level);
                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:bg-[var(--bg-secondary)]/50 ${!notification.read ? ui.color : 'bg-[var(--bg-card)] border-transparent dark:border-[var(--border-subtle)] opacity-60'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {ui.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <p className={`font-black text-[11px] uppercase tracking-wide leading-tight ${ui.text}`}>
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
                                                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-snug">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2 flex items-center gap-2">
                                                            {notification.time} • nivel: {notification.level}
                                                        </p>
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
                                    router.push(panelInfo.redirect);
                                    setIsOpen(false);
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                            >
                                {panelInfo.cta}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
