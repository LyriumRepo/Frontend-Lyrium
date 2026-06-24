import { ChatPageClient } from '@/features/customer/chat/ChatPageClient';

interface PageProps {
  searchParams: Promise<{ conversation?: string }>;
}

export default async function ChatPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <ChatPageClient conversationId={params.conversation} />;
}
