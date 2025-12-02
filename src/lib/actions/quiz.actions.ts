'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '../session';

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
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, questions } = validatedFields.data;
  let db;

  try {
    db = await getDb();
    const quizId = crypto.randomUUID();

    await db.run('BEGIN TRANSACTION');

    await db.run('INSERT INTO quizzes (id, title) VALUES (?, ?)', quizId, title);

    for (const question of questions) {
      const questionId = crypto.randomUUID();
      // Ensure the correct answer is one of the options
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
    return { error: { form: errorMessage } };
  }

  revalidatePath('/admin/quizzes');
  redirect('/admin/quizzes');
}

export async function updateQuiz(prevState: any, formData: FormData) {
  const quizId = formData.get('quizId') as string;
  const parsedData = JSON.parse(formData.get('payload') as string);
  const validatedFields = quizSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  if(!quizId) {
    return { error: { form: 'Quiz ID is missing.' } };
  }

  const { title, questions } = validatedFields.data;
  let db;
  
  try {
    db = await getDb();
    
    await db.run('BEGIN TRANSACTION');
    // Update quiz title
    await db.run('UPDATE quizzes SET title = ? WHERE id = ?', title, quizId);
    
    // Delete old questions
    await db.run('DELETE FROM questions WHERE quizId = ?', quizId);

    // Insert new questions
    for (const question of questions) {
        const questionId = crypto.randomUUID();
         // Ensure the correct answer is one of the options
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
     return { error: { form: errorMessage } };
  }

  revalidatePath('/admin/quizzes');
  revalidatePath(`/quiz/${quizId}`);
  redirect('/admin/quizzes');
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
    redirect('/admin/quizzes');
}


export async function saveQuizResult(quizId: string, score: number, totalQuestions: number, incorrectQuestionIds: string[]) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // Do not save results for review quizzes
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
        revalidatePath('/dashboard');
    } catch (e) {
        console.error('Failed to save quiz result:', e);
        // Handle error appropriately
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
