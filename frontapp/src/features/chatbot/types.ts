export interface ChatBotMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface ChatBotState {
    isOpen: boolean;
    isMinimized: boolean;
    sessionId: string;
    messages: ChatBotMessage[];
    isTyping: boolean;
    error: string | null;
}

export interface ChatBotResponse {
    reply: string;
    source: 'faq' | 'ai';
}
