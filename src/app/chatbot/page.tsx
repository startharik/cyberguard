import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatbotClient } from '@/components/chatbot/ChatbotClient';
import { getChatHistory } from '@/lib/actions/chat.actions';
import type { ChatMessage } from '@/lib/types';

export default async function ChatbotPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const initialMessages: ChatMessage[] = await getChatHistory(user.id);

  return (
    <AppLayout user={user}>
        <div className="h-[calc(100vh-theme(spacing.24))]">
             <ChatbotClient user={user} initialMessages={initialMessages} />
        </div>
    </AppLayout>
  );
}
