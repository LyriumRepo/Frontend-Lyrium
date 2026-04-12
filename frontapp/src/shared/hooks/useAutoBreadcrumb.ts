"use client";
import { usePathname } from 'next/navigation';

const routeLabels: Record<string, string> = {
    // Admin
    '/admin': 'Admin',
    '/admin/sellers': 'Vendedores',
    '/admin/helpdesk': 'Helpdesk',
    '/admin/finance': 'Finanzas',
    '/admin/analytics': 'Analítica',
    '/admin/operations': 'Operaciones',
    '/admin/operations/expenses': 'Gastos',
    '/admin/inventory': 'Inventario',
    '/admin/rapifac': 'Facturación',
    '/admin/categories': 'Categorías',
    '/admin/contracts': 'Contratos',
    '/admin/reviews': 'Reseñas',
    '/admin/payments': 'Pagos',
    // Seller
    '/seller': 'Mi Tienda',
    '/seller/catalog': 'Catálogo',
    '/seller/sales': 'Ventas',
    '/seller/invoices': 'Facturas',
    '/seller/logistics': 'Logística',
    '/seller/finance': 'Finanzas',
    '/seller/services': 'Servicios',
    '/seller/agenda': 'Agenda',
    '/seller/chat': 'Chat',
    '/seller/help': 'Ayuda',
    '/seller/store': 'Tienda',
    '/seller/profile': 'Perfil',
    // Logistics
    '/logistics': 'Panel Logística',
    '/logistics/chat-vendors': 'Chat Vendedores',
    '/logistics/helpdesk': 'Mesa de Ayuda',
};

export function useAutoBreadcrumb() {
    const pathname = usePathname();
    
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href?: string }[] = [];
    
    let currentPath = '';
    let parentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        currentPath += `/${segment}`;
        
        // Check for dynamic route segment (e.g., [id])
        if (segment.startsWith('[')) {
            breadcrumbs.push({ label: 'Detalle', href: parentPath });
            continue;
        }
        
        // Check exact match first
        if (routeLabels[currentPath]) {
            const isLast = i === segments.length - 1;
            breadcrumbs.push({ 
                label: routeLabels[currentPath],
                href: isLast ? undefined : currentPath 
            });
        } else {
            // Fallback: capitalize segment
            const isLast = i === segments.length - 1;
            breadcrumbs.push({
                label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                href: isLast ? undefined : currentPath
            });
        }
        
        parentPath = currentPath;
    }
    
    return breadcrumbs;
}
