
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '../session';
import type { Quiz, QuizResult, Badge } from '../types';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';

const quizGenerationSchema = z.object({
  topic: z.string().min(1, 'Topic is required.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Very Hard']),
});


export async function generateAndSaveQuiz(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'You must be logged in to generate a quiz.' };
  }
  
  const validatedFields = quizGenerationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return {
      error: 'Invalid selection. Please choose a topic and difficulty.',
    };
  }

  const { topic, difficulty } = validatedFields.data;
  let db;

  try {
    db = await getDb();

    // Get user's performance history for the selected topic
    const history = await db.all<QuizResult[]>(
        'SELECT score, totalQuestions FROM quiz_results WHERE userId = ? AND topic = ? ORDER BY completedAt DESC LIMIT 5',
        user.id,
        topic
    );

    const performanceHistory = history.map(h => ({
        score: h.score,
        total: h.totalQuestions,
    }));

    // Generate the quiz using the AI flow
    const quizData = await generateQuiz({
        topic,
        difficulty,
        userSkillLevel: user.skillLevel || 'Beginner',
        performanceHistory
    });

    await db.run('BEGIN TRANSACTION');

    const quizId = crypto.randomUUID();

    await db.run('INSERT INTO quizzes (id, title, topic) VALUES (?, ?, ?)', quizId, quizData.title, topic);

    for (const question of quizData.questions) {
      const questionId = crypto.randomUUID();
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

    // Redirect to the newly created quiz
    return { quizId };

  } catch (e) {
    if (db) {
        await db.run('ROLLBACK');
    }
    console.error("Failed to generate quiz:", e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while generating the quiz. Please try again.';
    return { error: errorMessage };
  }
}

// ============== BADGE AWARDING LOGIC ==============

async function awardBadge(userId: string, badgeId: string) {
    const db = await getDb();
    const hasBadge = await db.get('SELECT 1 FROM user_badges WHERE userId = ? AND badgeId = ?', userId, badgeId);
    if (hasBadge) return; // Already has the badge

    await db.run(
        'INSERT INTO user_badges (id, userId, badgeId, earnedAt) VALUES (?, ?, ?, ?)',
        crypto.randomUUID(),
        userId,
        badgeId,
        new Date().toISOString()
    );
    console.log(`Awarded badge ${badgeId} to user ${userId}`);
}

async function checkPhishingMasterBadge(userId: string) {
    const db = await getDb();
    const phishingQuizCount = await db.get<{ count: number }>(`
      SELECT COUNT(DISTINCT quizId) as count
      FROM quiz_results
      WHERE userId = ? AND topic = 'Phishing' AND (score * 100.0 / totalQuestions) >= 80
    `, userId);
    
    // Example: Award if they've passed 3+ phishing quizzes with 80%+
    if (phishingQuizCount && phishingQuizCount.count >= 3) {
      await awardBadge(userId, 'phishing-master');
    }
}

async function checkQuizStreakBadges(userId: string) {
    const db = await getDb();
    const user = await db.get('SELECT streak FROM users WHERE id = ?', userId);
    if (!user) return;
  
    const streak = user.streak;
  
    if (streak >= 5) {
      await awardBadge(userId, 'streak-5');
    } else if (streak >= 3) {
      await awardBadge(userId, 'streak-3');
    }
}


async function checkAndAwardBadges(userId: string) {
    await checkPhishingMasterBadge(userId);
    await checkQuizStreakBadges(userId);
    // Add calls to other badge checks here
    revalidatePath('/dashboard');
}


export async function saveQuizResult(quizId: string, topic: string, score: number, totalQuestions: number, incorrectQuestionIds: string[]) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // This is a temporary review quiz. Don't save a formal result, but do award a badge.
    if (quizId.startsWith('review-')) {
        try {
            await awardBadge(user.id, 'reviewer');
            revalidatePath('/dashboard');
        } catch (e) {
            console.error('Failed to award reviewer badge:', e);
        }
        return;
    }

    try {
        const db = await getDb();
        const resultId = crypto.randomUUID();

        await db.run(
            'INSERT INTO quiz_results (id, userId, quizId, topic, score, totalQuestions, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            resultId,
            user.id,
            quizId,
            topic,
            score,
            totalQuestions,
            new Date().toISOString()
        );

        // Log incorrect answers
        for (const questionId of incorrectQuestionIds) {
            await db.run(
                'INSERT INTO incorrect_answers (id, resultId, questionId) VALUES (?, ?, ?)',
                crypto.randomUUID(),
                resultId,
                questionId
            );
        }

        // Update user's streak
        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        if (percentage >= 75) {
            await db.run('UPDATE users SET streak = streak + 1 WHERE id = ?', user.id);
        } else {
            await db.run('UPDATE users SET streak = 0 WHERE id = ?', user.id);
        }

        // Award first quiz badge
        await awardBadge(user.id, 'quiz-initiate');
        
        // Award perfect score badge
        if (percentage === 100) {
            await awardBadge(user.id, 'perfect-score');
        }


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
