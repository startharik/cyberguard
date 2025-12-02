import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuizClient } from '@/components/quiz/QuizClient';
import type { Quiz, Question } from '@/lib/types';
import { getDb } from '@/lib/db';
import { Suspense } from 'react';

async function getQuizById(id: string): Promise<Quiz | undefined> {
  try {
    const db = await getDb();
    const quizData = await db.get('SELECT * FROM quizzes WHERE id = ?', id);
    if (!quizData) {
        return undefined;
    }

    const questionsData = await db.all<Question[]>('SELECT * FROM questions WHERE quizId = ?', id);
    
    // The options are stored as a JSON string, so we need to parse them.
    const questions = questionsData.map(q => ({
        ...q,
        options: JSON.parse(q.options as unknown as string),
    }));

    return { ...quizData, questions: questions };
  } catch (error) {
    console.error('Could not read quiz from database:', error);
    return undefined;
  }
}

async function QuizContent({ quizId }: { quizId: string }) {
    const user = await getCurrentUser();
    if (!user) {
      // This should be caught by middleware, but as a safeguard.
      redirect('/login');
    }
  
    const quiz = await getQuizById(quizId);
  
    if (!quiz) {
      return redirect('/quiz');
    }
  
    return (
      <AppLayout user={user}>
        <QuizClient quiz={quiz} user={user} />
      </AppLayout>
    );
  }

export default async function TakeQuizPage({
  params,
}: {
  params: { quizId: string };
}) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return (
        <Suspense fallback={
            <AppLayout user={user}>
                <div>Loading quiz...</div>
            </AppLayout>
        }>
            <QuizContent quizId={params.quizId} />
        </Suspense>
    );
}
