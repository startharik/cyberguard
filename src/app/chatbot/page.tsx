import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatbotClient } from '@/components/chatbot/ChatbotClient';

export default async function ChatbotPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AppLayout user={user}>
        <div className="h-[calc(100vh-theme(spacing.24))]">
             <ChatbotClient user={user} />
        </div>
    </AppLayout>
  );
}
