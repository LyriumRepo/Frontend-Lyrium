'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount?: number;
  isActive?: boolean;
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
  accentColor?: 'emerald' | 'violet' | 'sky';
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
};

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  features: customFeatures,
  loading = false,
  accentColor = 'emerald',
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
          <Icon name="Messages" className="w-12 h-12 mx-auto mb-4 text-[var(--text-secondary)]" />
          <p className="text-xs text-[var(--text-secondary)] font-black uppercase tracking-widest">
            Sin conversaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar" role="listbox" aria-label="Conversaciones">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          role="option"
          aria-selected={activeId === conv.id}
          className={`w-full p-6 border-b border-[var(--border-subtle)] text-left transition-all relative group ${
            activeId === conv.id 
              ? accent.activeBg 
              : accent.hoverBg
          }`}
        >
          {/* Active indicator */}
          {activeId === conv.id && (
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 ${accent.indicator} rounded-r-full`} aria-hidden="true" />
          )}
          
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-tight">
                {conv.name}
              </p>
            </div>
            
            {/* Unread badge */}
            {features.showUnreadCount && conv.unreadCount && conv.unreadCount > 0 && (
              <span className={`px-2 py-0.5 ${accent.badge} text-white text-[9px] font-black rounded-full flex items-center justify-center`} aria-label={`${conv.unreadCount} mensajes sin leer`}>
                {conv.unreadCount}
              </span>
            )}
          </div>
          
          <p className="text-[10px] text-[var(--text-secondary)] font-medium truncate mt-2 leading-relaxed">
            {conv.lastMessage}
          </p>
        </button>
      ))}
    </div>
  );
}
