'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount?: number;
  isActive?: boolean;
  lastMessageTime?: string;
  avatar?: string;
  storeName?: string;
  category?: string;
}

export interface ChatFeatures {
  showUnreadCount?: boolean;
  showCategories?: boolean;
  showCriticalBadge?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  features?: ChatFeatures;
  loading?: boolean;
  accentColor?: 'emerald' | 'violet' | 'sky' | 'turquesa';
}

const defaultFeatures: ChatFeatures = {
  showUnreadCount: true,
  showCategories: false,
  showCriticalBadge: false,
};

const accentColorMap = {
  emerald: {
    activeBg: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/5',
    indicator: 'bg-emerald-500',
    badge: 'bg-emerald-500 shadow-emerald-500/20',
  },
  violet: {
    activeBg: 'bg-violet-500/10',
    hoverBg: 'hover:bg-violet-500/5',
    indicator: 'bg-violet-500',
    badge: 'bg-violet-500 shadow-violet-500/20',
  },
  sky: {
    activeBg: 'bg-sky-500/10',
    hoverBg: 'hover:bg-sky-500/5',
    indicator: 'bg-sky-500',
    badge: 'bg-sky-500 shadow-sky-500/20',
  },
  turquesa: {
    activeBg: 'bg-[var(--turquesa-500)]/10',
    hoverBg: 'hover:bg-[var(--turquesa-500)]/5',
    indicator: 'bg-[var(--turquesa-500)]',
    badge: 'bg-[var(--turquesa-500)] shadow-[var(--turquesa-500)]/20',
  },
};

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  features: customFeatures,
  loading = false,
  accentColor = 'turquesa',
}: ConversationListProps) {
  const features = { ...defaultFeatures, ...customFeatures };
  const accent = accentColorMap[accentColor];

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={`conv-skel-${i}`} className="p-4 animate-pulse">
            <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-center">
        <div>
          <Icon name="MessageCircle" className="w-12 h-12 mx-auto mb-4 text-[var(--text-secondary)]" />
          <p className="text-xs text-[var(--text-secondary)] font-black uppercase tracking-widest">
            Sin conversaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-thin" role="listbox" aria-label="Conversaciones">
      {conversations.map((conv) => {
        const initial = (conv.storeName ?? conv.name).charAt(0).toUpperCase();
        const colors = [
          'from-sky-400 to-blue-500',
          'from-emerald-400 to-teal-500',
          'from-violet-400 to-purple-500',
          'from-amber-400 to-orange-500',
          'from-rose-400 to-pink-500',
          'from-cyan-400 to-sky-500',
        ];
        const colorIdx = conv.id.charCodeAt(0) % colors.length;
        const avatarGrad = colors[colorIdx];
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            role="option"
            aria-selected={activeId === conv.id}
            className={`w-full p-4 border-b border-[var(--border-subtle)] text-left transition-all duration-200 relative group ${
              activeId === conv.id 
                ? `${accent.activeBg} bg-opacity-50` 
                : `${accent.hoverBg} hover:pl-6`
            }`}
          >
            {activeId === conv.id && (
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 ${accent.indicator} rounded-r-full shadow-sm`} aria-hidden="true" />
            )}
            
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 shrink-0 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-black text-sm shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-black truncate uppercase tracking-tight transition-colors duration-200 ${
                    activeId === conv.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {conv.storeName ?? conv.name}
                  </p>
                  {conv.lastMessageTime && (
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 shrink-0 font-medium">
                      {conv.lastMessageTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className={`text-[10px] leading-relaxed truncate ${
                    conv.unreadCount && conv.unreadCount > 0
                      ? 'font-bold text-[var(--text-primary)]'
                      : 'font-medium text-[var(--text-secondary)]'
                  }`}>
                    {conv.lastMessage}
                  </p>
                  {features.showUnreadCount && conv.unreadCount && conv.unreadCount > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 ${accent.badge} text-white text-[9px] font-black rounded-full min-w-[18px] text-center leading-none`} aria-label={`${conv.unreadCount} mensajes sin leer`}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                {conv.category && (
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium mt-1 uppercase tracking-wider">
                    {conv.category}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
