'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

export interface Message {
  id?: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface MessageBubbleProps {
  messages: Message[];
  currentUserId?: string;
}

const isSentByMe = (message: Message, currentUserId?: string): boolean => {
  if (currentUserId) {
    return message.sender === currentUserId;
  }
  return message.sender === 'user' || message.sender === 'operator';
};

export default function MessageBubble({ messages, currentUserId }: MessageBubbleProps) {
  return (
    <div className="space-y-6">
      {messages.map((msg) => {
        const isSent = isSentByMe(msg, currentUserId);
        
        return (
          <div key={msg.id || msg.timestamp} className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[75%] p-5 rounded-[2rem] shadow-sm transform transition-all hover:scale-[1.01] ${
              isSent
                ? 'bg-emerald-500 text-white rounded-tr-none shadow-emerald-100'
                : 'bg-sky-500 text-white rounded-tl-none shadow-sky-100'
            }`}>
              <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
              <div className="flex items-center justify-end gap-1 mt-2">
                <p className={`text-[8px] font-black uppercase tracking-tighter ${isSent ? 'text-emerald-200' : 'text-sky-200'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {isSent && <Icon name="CheckCheck" className="w-3 h-3 text-emerald-200" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
