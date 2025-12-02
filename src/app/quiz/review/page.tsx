import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuizClient } from '@/components/quiz/QuizClient';
import type { Quiz, Question } from '@/lib/types';
import { getDb } from '@/lib/db';
import { Suspense } from 'react';

async function getReviewQuiz(questionIds: string[]): Promise<Quiz | undefined> {
  if (!questionIds || questionIds.length === 0) {
    return undefined;
  }

  try {
    const db = await getDb();
    
    // Create placeholders for the query
    const placeholders = questionIds.map(() => '?').join(',');
    
    const questionsData = await db.all<Question[]>(
      `SELECT * FROM questions WHERE id IN (${placeholders})`,
      ...questionIds
    );
    
    if (questionsData.length === 0) {
        return undefined;
    }
    
    const questions = questionsData.map(q => ({
        ...q,
        options: JSON.parse(q.options as unknown as string),
    }));

    const reviewQuiz: Quiz = {
      id: `review-${crypto.randomUUID()}`,
      title: 'Review Missed Questions',
      questions: questions,
    };

    return reviewQuiz;
  } catch (error) {
    console.error('Could not create review quiz from database:', error);
    return undefined;
  }
}

async function ReviewQuizContents({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined }}) {
    const user = await getCurrentUser();
    if (!user) {
      redirect('/login');
    }

    let questionIds: string[] = [];
    try {
      const idsParam = searchParams?.questionIds as string;
      if(idsParam) {
        questionIds = JSON.parse(idsParam);
      }
    } catch (e) {
        console.error("Failed to parse question IDs", e);
        return redirect('/quiz');
    }
    
    const quiz = await getReviewQuiz(questionIds);
    
    if (!quiz) {
      return redirect('/quiz');
    }
    
    return (
        <AppLayout user={user}>
            <QuizClient quiz={quiz} user={user} />
        </AppLayout>
    )
}

export default async function ReviewQuizPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined }}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <Suspense fallback={
        <AppLayout user={user}>
            <div>Loading review...</div>
        </AppLayout>
    }>
      <ReviewQuizContents searchParams={searchParams} />
    </Suspense>
  );
}
