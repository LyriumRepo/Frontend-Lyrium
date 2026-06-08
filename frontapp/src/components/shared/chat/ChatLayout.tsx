'use client';

import React from 'react';
import { CHAT_CONFIG } from '@/shared/lib/config/chat-config';

interface ChatLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  listWidth?: 'col-span-3' | 'col-span-4' | 'col-span-5';
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
  listWidth = defaultListWidth 
}: ChatLayoutProps) {
  const detailWidth = detailWidthMap[listWidth];

  return (
    <div className={`grid grid-cols-12 ${CHAT_CONFIG.spacing.gap} h-full min-h-0`}>
      <div className={`
        ${listWidth} 
        bg-white/70 dark:bg-[var(--bg-secondary)]/70
        backdrop-blur-xl
        ${CHAT_CONFIG.card.rounded} 
        border 
        border-white/20 dark:border-[var(--border-subtle)]/50
        shadow-lg shadow-black/5
        overflow-hidden 
        flex 
        flex-col
      `}>
        {list}
      </div>
      
      <div className={`
        ${detailWidth} 
        bg-white/70 dark:bg-[var(--bg-secondary)]/70
        backdrop-blur-xl
        ${CHAT_CONFIG.card.rounded} 
        border 
        border-white/20 dark:border-[var(--border-subtle)]/50
        shadow-lg shadow-black/5
        overflow-hidden 
        flex 
        flex-col 
        min-h-0
      `}>
        {detail}
      </div>
    </div>
  );
}
