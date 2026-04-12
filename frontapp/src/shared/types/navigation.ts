export interface NavItem {
    id?: string;
    label: string;
    href: string;
    icon?: string;
    description?: string;
    badge?: string | number;
    children?: NavItem[];
    color?: string;
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

export type PanelNavigation = NavSection[];

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface UserMenuProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
        role: 'admin' | 'seller';
    };
}

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}
