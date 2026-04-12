'use client';

import { ReactNode } from 'react';

type LayoutType = 'sidebar-right' | 'sidebar-left' | 'full-width' | 'basic';

interface StoreLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  layout?: LayoutType;
}

export default function StoreLayout({ children, sidebar, layout = 'full-width' }: StoreLayoutProps) {
  const layoutClasses: Record<LayoutType, string> = {
    'sidebar-right': 'flex flex-col lg:flex-row gap-6',
    'sidebar-left': 'flex flex-col lg:flex-row gap-6 lg:flex-row-reverse',
    'full-width': 'flex flex-col',
    'basic': 'flex flex-col',
  };

  return (
    <div className={layoutClasses[layout]}>
      {/* Sidebar - solo visible en desktop para sidebar-right y sidebar-left */}
      {(layout === 'sidebar-right' || layout === 'sidebar-left') && sidebar && (
        <div className="hidden lg:block w-72 flex-shrink-0">
          {sidebar}
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
