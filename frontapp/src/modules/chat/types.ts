export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';

export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica' | 'Low' | 'Medium' | 'High' | 'Urgent';

export type SenderRole = 'admin' | 'vendor' | 'user' | 'system';

export interface MessageAttachment {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'file';
}

export interface UnifiedMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: SenderRole;
  content: string;
  timestamp: Date;
  hour: string;
  attachments?: MessageAttachment[];
  isQuickReply?: boolean;
  isEscalation?: boolean;
  isRead?: boolean;
}

export interface AssignedTo {
  role: 'admin' | 'vendor' | 'logistics';
  id: string;
  name: string;
}

export interface UnifiedTicket {
  id: string;
  displayId: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority?: TicketPriority;
  assignedTo: AssignedTo;
  requester: {
    name: string;
    email?: string;
    company?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  messages: UnifiedMessage[];
  unreadCount?: number;
  surveyRequired?: boolean;
  satisfactionRating?: number;
  satisfactionComment?: string;
  escalated?: boolean;
  escalatedTo?: string | null;
  category?: string;
  source: 'admin' | 'seller' | 'logistics';
}

export interface ChatSendPayload {
  text: string;
  attachments?: File[];
  isQuick?: boolean;
}

export interface ChatViewProps {
  ticket: UnifiedTicket;
  onSendMessage: (payload: ChatSendPayload) => void;
  onCloseTicket?: () => void;
  onSubmitSurvey?: (rating: number, comment: string) => void;
  onPriorityChange?: (id: string, priority: TicketPriority) => void;
  onAdminChange?: (id: string, adminId: string) => void;
  onEscalate?: () => void;
  onBack?: () => void;
  onLoadMore?: () => void;
  isSending?: boolean;
  isClosing?: boolean;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
  showAdminControls?: boolean;
  quickReplies?: string[];
}

export interface ChatInputProps {
  onSendMessage: (payload: ChatSendPayload) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatMessageProps {
  message: UnifiedMessage;
}
