import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuizClient } from '@/components/quiz/QuizClient';
import type { Quiz } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

async function getQuizById(id: string): Promise<Quiz | undefined> {
  const filePath = path.join(process.cwd(), 'data/quizzes.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const quizzes: Quiz[] = JSON.parse(data);
    return quizzes.find(quiz => quiz.id === id);
  } catch (error) {
    console.error('Could not read quizzes file:', error);
    return undefined;
  }
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

  const quiz = await getQuizById(params.quizId);

  if (!quiz) {
    return redirect('/quiz');
  }

  return (
    <AppLayout user={user}>
      <QuizClient quiz={quiz} />
    </AppLayout>
  );
}
