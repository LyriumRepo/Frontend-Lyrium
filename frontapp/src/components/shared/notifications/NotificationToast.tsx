'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { isAllowedForRole } from '@/shared/lib/notifications/roleNotificationTypes';
import { resolveNotificationRoute } from '@/shared/lib/notifications/resolveNotificationRoute';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  level: string;
  action?: { type: string; id?: string | number; label: string };
  exiting: boolean;
}

export default function NotificationToast() {
  const { notifications, loading } = useNotifications();
  const { user } = useAuth();
  const router = useRouter();

  const filteredNotifications = notifications.filter(n =>
    isAllowedForRole(n.metadata?.type ?? '', user?.role, 'toast')
  );
  const [items, setItems] = useState<ToastItem[]>([]);
  const lastIdRef = useRef<string | null>(null);
  const isSeededRef = useRef(false);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, exiting: true } : i));
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
    }, 400);
  }, []);

  // Seed the last seen ID once the initial REST load completes, to avoid
  // showing toasts for pre-existing notifications on page load.
  useEffect(() => {
    if (!loading && !isSeededRef.current) {
      isSeededRef.current = true;
      lastIdRef.current = filteredNotifications[0]?.id ?? null;
    }
  }, [loading, filteredNotifications]);

  useEffect(() => {
    if (!isSeededRef.current) return;
    if (filteredNotifications.length === 0) return;

    const latest = filteredNotifications[0];
    if (latest.id === lastIdRef.current) return;
    lastIdRef.current = latest.id;

    const item: ToastItem = {
      id: latest.id,
      title: latest.title,
      message: latest.message,
      level: latest.level,
      action: latest.action,
      exiting: false,
    };

    setItems(prev => [item, ...prev].slice(0, 3));

    const timer = setTimeout(() => remove(item.id), 5000);
    return () => clearTimeout(timer);
  }, [filteredNotifications, remove]);

  const getIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'SECURITY':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <Bell className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--brand-green)]" />;
    }
  };

  const getBorder = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'SECURITY':
        return 'border-l-red-500';
      case 'WARNING':
        return 'border-l-amber-500';
      default:
        return 'border-l-[var(--brand-green)]';
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[100002] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {items.map(item => (
        <div
          key={item.id}
          onClick={() => {
            if (item.action) {
              const route = resolveNotificationRoute(item.action.type, item.action.id, user?.role);
              router.push(route);
            }
            remove(item.id);
          }}
          className={`pointer-events-auto bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl shadow-lg ${getBorder(item.level)} border-l-4 pl-3 pr-4 py-3 flex items-start gap-3 ${item.exiting ? 'animate-fade-out' : 'animate-fade-slide-in'} ${item.action ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)] transition-colors' : ''}`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {getIcon(item.level)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
              {item.title}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-tight">
              {item.message}
            </p>
            {item.action && (
              <p className="text-[10px] font-bold text-[var(--brand-green)] mt-1 uppercase tracking-wider">
                {item.action.label} →
              </p>
            )}
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              remove(item.id);
            }}
            className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
