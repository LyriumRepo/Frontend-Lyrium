'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { Bell, AlertTriangle, X } from 'lucide-react';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  level: string;
  action?: { type: string; id?: string | number; label: string };
  exiting: boolean;
}

function resolveRoute(actionType: string, actionId: string | number | undefined, role: string | undefined): string {
  const prefix = role === 'administrator' ? '/admin'
    : role === 'seller' ? '/seller'
    : role === 'customer' ? '/customer'
    : role === 'logistics_operator' ? '/logistics'
    : '';

  switch (actionType) {
    case 'orders':
      return `${prefix}/orders`;
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
}

const roleNotificationTypes: Record<string, string[]> = {
  customer: ['order_created', 'OrderCreatedNotification'],
  seller: ['new_order', 'NewOrderSellerNotification', 'store_status_changed', 'StoreStatusNotification'],
  administrator: ['ticket_created', 'TicketCreatedNotification', 'ticket_replied', 'TicketRepliedNotification', 'ticket_status_changed', 'TicketStatusChangedNotification', 'order_created', 'OrderCreatedNotification', 'new_order', 'NewOrderSellerNotification', 'store_status_changed', 'StoreStatusNotification'],
  logistics_operator: [],
};

export default function NotificationToast() {
  const { notifications } = useNotifications();
  const { user } = useAuth();
  const router = useRouter();

  const filteredNotifications = notifications.filter(n => {
    const allowed = roleNotificationTypes[user?.role ?? ''] ?? [];
    if (allowed.length === 0) return true;
    const type = n.metadata?.type ?? '';
    return allowed.some(t => type.includes(t));
  });
  const [items, setItems] = useState<ToastItem[]>([]);
  const lastIdRef = useRef<string | null>(null);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, exiting: true } : i));
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
    }, 400);
  }, []);

  useEffect(() => {
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
        return <Bell className="w-4 h-4 text-[#2d5e42]" />;
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
        return 'border-l-[#2d5e42]';
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
              const route = resolveRoute(item.action.type, item.action.id, user?.role);
              router.push(route);
            }
            remove(item.id);
          }}
          className={`pointer-events-auto bg-white dark:bg-[#1a2e26] border border-gray-200 dark:border-[#2d5e42]/30 rounded-xl shadow-lg ${getBorder(item.level)} border-l-4 pl-3 pr-4 py-3 flex items-start gap-3 ${item.exiting ? 'animate-fade-out' : 'animate-fade-slide-in'} ${item.action ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#24382e] transition-colors' : ''}`}
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
              <p className="text-[10px] font-bold text-[#2d5e42] dark:text-[#4A7C59] mt-1 uppercase tracking-wider">
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
