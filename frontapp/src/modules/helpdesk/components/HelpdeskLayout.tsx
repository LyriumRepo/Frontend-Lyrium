'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { TicketList } from './TicketList';
import { ChatView } from '@/modules/chat';
import { UnifiedTicketListItem, TicketFilters } from '../types';
import { UnifiedTicket } from '@/modules/chat/types';
import BaseButton from '@/components/ui/BaseButton';
import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';

export interface HelpdeskLayoutProps {
  title: string;
  subtitle: string;
  icon?: string;
  
  tickets: UnifiedTicketListItem[];
  selectedTicket: UnifiedTicket | null;
  filters: TicketFilters;
  
  onSelectTicket: (id: string) => void;
  onFilterChange: (filters: Partial<TicketFilters>) => void;
  onSendMessage: (text: string, isQuick?: boolean) => Promise<void>;
  onCreateTicket?: (subject: string, content: string) => void;
  onCloseTicket?: () => void;
  
  showPriority?: boolean;
  showNewTicketButton?: boolean;
  showAdminControls?: boolean;
  isSending?: boolean;
  isClosing?: boolean;
  height?: string;
}

export function HelpdeskLayout({
  title,
  subtitle,
  icon = 'Headset',
  tickets,
  selectedTicket,
  filters,
  onSelectTicket,
  onFilterChange,
  onSendMessage,
  onCreateTicket,
  onCloseTicket,
  showPriority = true,
  showNewTicketButton = true,
  showAdminControls = false,
  isSending = false,
  isClosing = false,
  height = 'calc(100vh - 200px)',
}: HelpdeskLayoutProps) {
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketContent, setNewTicketContent] = useState('');

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim() || !newTicketContent.trim() || !onCreateTicket) return;
    onCreateTicket(newTicketSubject, newTicketContent);
    setNewTicketSubject('');
    setNewTicketContent('');
    setIsNewTicketOpen(false);
  };

  const headerActions = showNewTicketButton && onCreateTicket ? (
    <BaseButton
      variant="primary"
      leftIcon="PlusCircle"
      onClick={() => setIsNewTicketOpen(true)}
    >
      Nuevo Ticket
    </BaseButton>
  ) : undefined;

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader 
        title={title} 
        subtitle={subtitle} 
        icon={icon}
        actions={headerActions}
      />

      <div 
        className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col bg-[var(--bg-card)]"
        style={{ height }}
      >
        <div className="flex h-full overflow-hidden">
          {/* Lista de Tickets */}
          <div 
            className="h-full flex-shrink-0 border-r border-[var(--border-subtle)]"
            style={{ width: '280px', minWidth: '280px' }}
          >
            <TicketList
              tickets={tickets}
              selectedId={selectedTicket?.id || null}
              onSelect={onSelectTicket}
              filters={filters}
              onFilterChange={onFilterChange}
              showPriority={showPriority}
              className="!w-full !rounded-none !border-none h-full"
            />
          </div>

          {/* Chat/Ticket Detail */}
          <div className="flex-1 h-full bg-[var(--bg-card)]">
            {selectedTicket ? (
              <ChatView
                ticket={selectedTicket}
                onSendMessage={onSendMessage}
                onCloseTicket={onCloseTicket}
                isSending={isSending}
                isClosing={isClosing}
                showAdminControls={showAdminControls}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-[var(--bg-card)]">
                <div className="text-center">
                  <Icon name="MessageCircle" className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-bold text-[var(--text-secondary)]">Selecciona un ticket para ver la conversación</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear ticket */}
      {onCreateTicket && (
        <BaseModal
          isOpen={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          title="Crear Nuevo Ticket"
          subtitle="Envía una solicitud al equipo de soporte"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Asunto</label>
              <input
                type="text"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Describe brevemente el problema..."
                className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border-none rounded-2xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Descripción</label>
              <textarea
                value={newTicketContent}
                onChange={(e) => setNewTicketContent(e.target.value)}
                placeholder="Proporciona detalles adicionales..."
                rows={4}
                className="w-full px-4 py-3.5 bg-[var(--bg-secondary)]/50 border-none rounded-2xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-sky-500/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <BaseButton variant="secondary" onClick={() => setIsNewTicketOpen(false)}>
                Cancelar
              </BaseButton>
              <BaseButton
                variant="primary"
                onClick={handleCreateTicket}
                disabled={!newTicketSubject.trim() || !newTicketContent.trim()}
              >
                Crear Ticket
              </BaseButton>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
