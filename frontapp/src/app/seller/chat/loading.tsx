/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Chat
 * 
 * Skeleton para streaming del chat con clientes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-gray-100 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-3 w-40 bg-gray-100 rounded"></div>
      </div>
      <div className="h-3 w-12 bg-gray-100 rounded"></div>
    </div>
  );
}

function MessageSkeleton({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-pulse`}>
      <div className={`max-w-[70%] p-3 rounded-2xl ${isOwn ? 'bg-gray-200' : 'bg-gray-100'}`}>
        <div className="h-4 w-48 bg-gray-300 rounded mb-1"></div>
        <div className="h-3 w-32 bg-gray-200 rounded ml-auto"></div>
      </div>
    </div>
  );
}

export default function ChatLoading() {
  return (
    // Mismo wrapper que ChatPageClient (flex-1 min-h-0 + p-4 md:p-8) para que el
    // skeleton no salte de posición cuando el contenido real reemplaza este loading.
    <div className="flex flex-col flex-1 min-h-0 animate-fadeIn p-4 md:p-8">
      <ModuleHeader
        title="Chat con Clientes"
        subtitle="Comunicación directa con tus clientes"
        icon="Messages"
      />

      <div className="flex-1 min-h-0 flex gap-6">
        {/* Conversations List */}
        <div className="hidden lg:flex w-80 shrink-0 rounded-[2.5rem] border border-gray-200 bg-white flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="h-10 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col rounded-[2.5rem] border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <MessageSkeleton key={i} isOwn={i % 2 === 0} />
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
