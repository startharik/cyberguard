
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuizGenerator } from '@/components/quiz/QuizGenerator';

export default async function QuizPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return (
        <AppLayout user={user}>
            <div className="flex items-center justify-center">
                <QuizGenerator user={user} />
            </div>
        </AppLayout>
    );
}

