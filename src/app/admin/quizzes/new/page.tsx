
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuizForm } from '@/components/admin/QuizForm';
import { Suspense } from 'react';

async function NewQuizContent() {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
        redirect('/dashboard');
    }

    return (
        <AppLayout user={user}>
            <div className="space-y-1">
                <h1 className="text-2xl font-bold font-headline">Create New Quiz</h1>
                <p className="text-muted-foreground">
                Fill out the form below to add a new quiz.
                </p>
            </div>
            <QuizForm />
        </AppLayout>
    );
}


export default async function NewQuizPage() {
    // We can get the user here to pass to the layout, as it will be available
    // for the Suspense fallback.
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return (
        <Suspense fallback={
            <AppLayout user={user}>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-headline">Create New Quiz</h1>
                    <p className="text-muted-foreground">
                        Loading form...
                    </p>
                </div>
            </AppLayout>
        }>
            <NewQuizContent />
        </Suspense>
    );
}
