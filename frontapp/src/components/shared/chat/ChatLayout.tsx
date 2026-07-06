'use client';

import React from 'react';
import { CHAT_CONFIG } from '@/shared/lib/config/chat-config';

interface ChatLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  listWidth?: 'col-span-3' | 'col-span-4' | 'col-span-5';
  /** En mobile/tablet controla si se muestra la lista (true) o el detalle (false) */
  isMobileListVisible?: boolean;
}

const defaultListWidth = 'col-span-4';

const detailWidthMap: Record<string, string> = {
  'col-span-3': 'col-span-9',
  'col-span-4': 'col-span-8',
  'col-span-5': 'col-span-7',
};

export default function ChatLayout({
  list,
  detail,
  listWidth = defaultListWidth,
  isMobileListVisible = true,
}: ChatLayoutProps) {
  const detailWidth = detailWidthMap[listWidth];

  return (
    <div className={`grid grid-cols-12 ${CHAT_CONFIG.spacing.gap} h-full min-h-0`}>

      {/* ── Lista de conversaciones ────────────────────────────────────────────
          Mobile/tablet : ocupa toda la pantalla, se oculta cuando hay un chat activo
          Desktop (lg+) : columna fija según listWidth                           */}
      <div className={`
        ${isMobileListVisible ? 'flex' : 'hidden'}
        lg:flex
        col-span-12
        lg:${listWidth}
        flex-col
        bg-[var(--bg-card)]
        rounded-[2rem]
        lg:rounded-[2.5rem]
        border
        border-[var(--border-subtle)]
        shadow-sm
        overflow-hidden
      `}>
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf] rounded-t-[2rem] lg:rounded-t-[2.5rem]" />
        {list}
      </div>

      {/* ── Panel de detalle / chat activo ────────────────────────────────────
          Mobile/tablet : ocupa toda la pantalla, se oculta cuando se muestra la lista
          Desktop (lg+) : columna variable según detailWidth                     */}
      <div className={`
        ${isMobileListVisible ? 'hidden' : 'flex'}
        lg:flex
        col-span-12
        lg:${detailWidth}
        flex-col
        rounded-[2rem]
        lg:rounded-[2.5rem]
        border
        border-[var(--border-subtle)]
        shadow-xl
        overflow-hidden
        min-h-0
      `}
        style={{ background: 'linear-gradient(160deg, color-mix(in srgb,#9cb04e 6%,var(--bg-card)) 0%, var(--bg-card) 45%, color-mix(in srgb,#499bbf 5%,var(--bg-card)) 100%)' }}
      >
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf] rounded-t-[2rem] lg:rounded-t-[2.5rem]" />
        {detail}
      </div>

    </div>
  );
}