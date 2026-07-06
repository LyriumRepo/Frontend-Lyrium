'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useUIStore } from '@/store/uiStore';
import { isAllowedForRole } from '@/shared/lib/notifications/roleNotificationTypes';

export default function NotificationBell() {
    const { notifications } = useNotifications();
    const { user } = useAuth();
    const { notificationSidebarOpen, toggleNotificationSidebar } = useUIStore();

    const unreadFiltered = notifications.filter(n =>
        !n.read && isAllowedForRole(n.metadata?.type ?? '', user?.role, 'bell')
    ).length;

    return (
        <button
            onClick={toggleNotificationSidebar}
            className={`relative p-2.5 rounded-xl transition-all ${notificationSidebarOpen ? 'bg-[var(--bg-secondary)] text-sky-500 dark:text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
            aria-label="Centro de Notificaciones"
        >
            <Bell className="w-5 h-5" />
            {unreadFiltered > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)] animate-pulse">
                    {unreadFiltered > 9 ? '9+' : unreadFiltered}
                </span>
            )}
        </button>
    );
}
