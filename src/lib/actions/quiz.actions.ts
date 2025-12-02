


'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '../session';
import type { QuizResult, Badge } from '../types';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required.'),
  options: z.array(z.string().min(1, 'Option text is required.')).min(2, 'At least two options are required.'),
  correctAnswer: z.string().min(1, 'Correct answer is required.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  questions: z.array(questionSchema).min(1, 'At least one question is required.'),
});


export async function createQuiz(prevState: any, formData: FormData) {
  const parsedData = JSON.parse(formData.get('payload') as string);
  const validatedFields = quizSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
      error: { fieldErrors: validatedFields.error.flatten().fieldErrors },
      isInitial: false,
    };
  }

  const { title, questions } = validatedFields.data;
  let db;

  try {
    db = await getDb();
    await db.run('BEGIN TRANSACTION');

    const quizId = crypto.randomUUID();

    await db.run('INSERT INTO quizzes (id, title) VALUES (?, ?)', quizId, title);

    for (const question of questions) {
      const questionId = crypto.randomUUID();
      if (!question.options.includes(question.correctAnswer)) {
          throw new Error(`Correct answer "${question.correctAnswer}" is not in the options for question "${question.text}".`);
      }
      await db.run(
        'INSERT INTO questions (id, quizId, text, options, correctAnswer, difficulty) VALUES (?, ?, ?, ?, ?, ?)',
        questionId,
        quizId,
        question.text,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.difficulty
      );
    }

    await db.run('COMMIT');
  } catch (e) {
    if (db) {
        await db.run('ROLLBACK');
    }
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.';
    return { error: { form: errorMessage }, isInitial: false, };
  }

  revalidatePath('/admin/quizzes');
  return { error: null, isInitial: false };
}

export async function updateQuiz(prevState: any, formData: FormData) {
  const quizId = formData.get('quizId') as string;
  const parsedData = JSON.parse(formData.get('payload') as string);
  const validatedFields = quizSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
      error: { fieldErrors: validatedFields.error.flatten().fieldErrors },
      isInitial: false,
    };
  }
  
  if(!quizId) {
    return { error: { form: 'Quiz ID is missing.' }, isInitial: false, };
  }

  const { title, questions } = validatedFields.data;
  let db;
  
  try {
    db = await getDb();
    
    await db.run('BEGIN TRANSACTION');
    await db.run('UPDATE quizzes SET title = ? WHERE id = ?', title, quizId);
    await db.run('DELETE FROM questions WHERE quizId = ?', quizId);

    for (const question of questions) {
        const questionId = crypto.randomUUID();
        if (!question.options.includes(question.correctAnswer)) {
            throw new Error(`Correct answer "${question.correctAnswer}" is not in the options for question "${question.text}".`);
        }
        await db.run(
            'INSERT INTO questions (id, quizId, text, options, correctAnswer, difficulty) VALUES (?, ?, ?, ?, ?, ?)',
            questionId,
            quizId,
            question.text,
            JSON.stringify(question.options),
            question.correctAnswer,
            question.difficulty
        );
    }
    await db.run('COMMIT');
  } catch (e) {
     if (db) {
        await db.run('ROLLBACK');
     }
     console.error(e);
     const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.';
     return { error: { form: errorMessage }, isInitial: false, };
  }

  revalidatePath('/admin/quizzes');
  revalidatePath(`/quiz/${quizId}`);
  return { error: null, isInitial: false };
}

export async function deleteQuiz(formData: FormData) {
    const quizId = formData.get('quizId') as string;
    if (!quizId) {
        throw new Error('Quiz ID is required for deletion.');
    }

    try {
        const db = await getDb();
        await db.run('DELETE FROM quizzes WHERE id = ?', quizId);
    } catch (e) {
        console.error(e);
        // In a real app, you might want to redirect with an error message.
        throw new Error('Failed to delete quiz.');
    }

    revalidatePath('/admin/quizzes');
}

async function checkAndAwardBadges(userId: string) {
    const db = await getDb();
    
    // Check for "Phishing Master" badge
    const phishingBadgeId = 'phishing-master';
    const hasBadge = await db.get('SELECT 1 FROM user_badges WHERE userId = ? AND badgeId = ?', userId, phishingBadgeId);

    if (hasBadge) {
        return; // Already has the badge
    }

    const phishingQuizzes = await db.all("SELECT id FROM quizzes WHERE title LIKE '%Phishing%'");
    if (phishingQuizzes.length === 0) return;

    const phishingQuizIds = phishingQuizzes.map(q => q.id);
    
    const userBestScores = await db.all<{ quizId: string, bestScore: number }>(`
        SELECT quizId, MAX(score * 100.0 / totalQuestions) as bestScore 
        FROM quiz_results 
        WHERE userId = ? AND quizId IN (${phishingQuizIds.map(() => '?').join(',')})
        GROUP BY quizId
    `, userId, ...phishingQuizIds);

    const hasMasteredAll = phishingQuizzes.every(quiz => {
        const result = userBestScores.find(score => score.quizId === quiz.id);
        return result && result.bestScore >= 80;
    });

    if (hasMasteredAll) {
        await db.run(
            'INSERT INTO user_badges (id, userId, badgeId, earnedAt) VALUES (?, ?, ?, ?)',
            crypto.randomUUID(),
            userId,
            phishingBadgeId,
            new Date().toISOString()
        );
        revalidatePath('/dashboard');
    }
}


export async function saveQuizResult(quizId: string, score: number, totalQuestions: number, incorrectQuestionIds: string[]) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // Don't save results for the temporary review quizzes
    if (quizId.startsWith('review-')) {
        return;
    }

    try {
        const db = await getDb();
        await db.run(
            'INSERT INTO quiz_results (id, userId, quizId, score, totalQuestions, completedAt) VALUES (?, ?, ?, ?, ?, ?)',
            crypto.randomUUID(),
            user.id,
            quizId,
            score,
            totalQuestions,
            new Date().toISOString()
        );

        // After saving the result, check if the user earned any badges
        await checkAndAwardBadges(user.id);
        
        revalidatePath('/dashboard');
        revalidatePath('/quiz');
    } catch (e) {
        console.error('Failed to save quiz result:', e);
    }
}

export async function submitFeedback(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'You must be logged in to submit feedback.' };
    }

    const feedback = formData.get('feedback') as string;
    const quizId = formData.get('quizId') as string;

    if (!feedback || feedback.trim().length === 0) {
        return { error: 'Feedback cannot be empty.' };
    }

    if (!quizId) {
        return { error: 'Quiz ID is missing.' };
    }

    try {
        const db = await getDb();
        await db.run(
            'INSERT INTO quiz_feedback (id, userId, quizId, feedback, submittedAt) VALUES (?, ?, ?, ?, ?)',
            crypto.randomUUID(),
            user.id,
            quizId,
            feedback,
            new Date().toISOString()
        );
        return { success: 'Thank you for your feedback!' };
    } catch (e) {
        console.error('Failed to save feedback:', e);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
