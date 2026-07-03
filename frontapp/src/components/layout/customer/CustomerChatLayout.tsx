'use client';

import React from 'react';

/**
 * Variante de ChatLayout EXCLUSIVA del panel cliente.
 *
 * Por qué existe un archivo aparte en vez de tocar
 * `components/shared/chat/ChatLayout.tsx`:
 * ese componente lo usan también seller (chat) y logistics (chat-vendors),
 * y la idea es tocar SOLO el panel cliente sin arriesgar nada de los demás.
 *
 * Bug que corrige: el ChatLayout original es un `grid-cols-12` FIJO sin
 * ningún breakpoint — en mobile mete la lista de conversaciones y el chat
 * completo lado a lado, comprimidos. Esta versión muestra UN panel a la vez
 * por debajo de md (768px), estilo WhatsApp, controlado por `mobileView`.
 *
 * De md hacia arriba el resultado visual es PIXEL-IDÉNTICO al ChatLayout
 * original (mismo grid-cols-12, gap-4, rounded-[2.5rem], shadow-xl, etc).
 */

interface CustomerChatLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  listWidth?: 'col-span-3' | 'col-span-4' | 'col-span-5';
  /**
   * Qué panel se muestra en mobile/tablet-portrait (< 768px).
   * De md en adelante siempre se ven ambos paneles, igual que antes.
   */
  mobileView?: 'list' | 'detail';
}

const LIST_WIDTH_CLASSES: Record<string, string> = {
  'col-span-3': 'md:col-span-3',
  'col-span-4': 'md:col-span-4',
  'col-span-5': 'md:col-span-5',
};

const DETAIL_WIDTH_CLASSES: Record<string, string> = {
  'col-span-3': 'md:col-span-9',
  'col-span-4': 'md:col-span-8',
  'col-span-5': 'md:col-span-7',
};

export default function CustomerChatLayout({
  list,
  detail,
  listWidth = 'col-span-4',
  mobileView = 'list',
}: CustomerChatLayoutProps) {
  const listColClass = LIST_WIDTH_CLASSES[listWidth];
  const detailColClass = DETAIL_WIDTH_CLASSES[listWidth];

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 h-full min-h-0">
      {/* Panel de lista (conversaciones / tickets) */}
      <div
        className={`
          ${mobileView === 'list' ? 'flex' : 'hidden'} md:flex
          ${listColClass}
          bg-[var(--bg-card)]
          rounded-2xl md:rounded-[2.5rem]
          border border-[var(--border-subtle)]
          shadow-sm
          overflow-hidden
          flex-col
          h-full
          min-h-0
        `}
      >
        <div className="hidden md:block h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf] rounded-t-[2.5rem]" />
        {list}
      </div>

      {/* Panel de detalle (conversación activa) */}
      <div
        className={`
          ${mobileView === 'detail' ? 'flex' : 'hidden'} md:flex
          ${detailColClass}
          rounded-2xl md:rounded-[2.5rem]
          border border-[var(--border-subtle)]
          shadow-sm md:shadow-xl
          overflow-hidden
          flex-col
          h-full
          min-h-0
        `}
        style={{ background: 'linear-gradient(160deg, color-mix(in srgb,#9cb04e 6%,var(--bg-card)) 0%, var(--bg-card) 45%, color-mix(in srgb,#499bbf 5%,var(--bg-card)) 100%)' }}
      >
        <div className="hidden md:block h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf] rounded-t-[2.5rem]" />
        {detail}
      </div>
    </div>
  );
}
