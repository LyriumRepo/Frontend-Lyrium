export type NotificationLevel = 'CRITICAL' | 'SECURITY' | 'OPERATIONAL' | 'INFO' | 'WARNING';

export interface ProactiveNotification {
    id: string;
    level: NotificationLevel;
    title: string;
    message: string;
    time: string;
    createdAt?: string;
    read: boolean;
    metadata?: {
        entityId?: string;
        type?: string;
    };
    action?: {
        type: string;
        id?: string | number;
        label: string;
    };
    secondaryAction?: {
        type: string;
        id?: string | number;
        label: string;
        icon?: string;
    };
}

export interface NotificationState {
    notifications: ProactiveNotification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}
