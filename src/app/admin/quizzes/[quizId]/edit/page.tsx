import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import type { Quiz, Question } from '@/lib/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuizForm } from '@/components/admin/QuizForm';

async function getQuizById(id: string): Promise<Quiz | undefined> {
  try {
    const db = await getDb();
    const quizData = await db.get('SELECT * FROM quizzes WHERE id = ?', id);
    if (!quizData) {
      return undefined;
    }

    const questionsData = await db.all<Question[]>(
      'SELECT * FROM questions WHERE quizId = ?',
      id
    );

    const questions = questionsData.map(q => ({
      ...q,
      options: JSON.parse(q.options as unknown as string),
    }));

    return { ...quizData, questions };
  } catch (error) {
    console.error('Could not read quiz from database:', error);
    return undefined;
  }
}

export default async function EditQuizPage({
  params,
}: {
  params: { quizId: string };
}) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect('/dashboard');
  }

  const quiz = await getQuizById(params.quizId);
  if (!quiz) {
    redirect('/admin/quizzes');
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-headline">Edit Quiz</h1>
        <p className="text-muted-foreground">
          Update the quiz details below.
        </p>
      </div>
      <QuizForm quiz={quiz} />
    </AppLayout>
  );
}
