export * from './types';

export { ChatView } from './components/ChatView';
export { ChatMessage } from './components/ChatMessage';
export { ChatInput } from './components/ChatInput';

export { useChatBase } from './hooks/useChatBase';
export type { ChatConversation, ChatMessage as ChatMessageType, ChatFilters } from './hooks/useChatBase';

export { adaptAdminTicket, adaptAdminTickets } from './adapters/adminTicketAdapter';
export { adaptSellerTicket, adaptSellerTickets } from './adapters/sellerTicketAdapter';
export { adaptLogisticsTicket, adaptLogisticsTickets } from './adapters/logisticsTicketAdapter';
