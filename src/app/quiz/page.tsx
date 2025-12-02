import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { getDb } from '@/lib/db';
import { Progress } from '@/components/ui/progress';


async function getQuizzes(userId: string): Promise<Quiz[]> {
    try {
        const db = await getDb();
        const quizzes = await db.all('SELECT id, title FROM quizzes');
        
        for (const quiz of quizzes) {
            const questions = await db.all('SELECT id FROM questions WHERE quizId = ?', quiz.id);
            quiz.questions = questions;

            const bestScoreResult = await db.get(
              'SELECT MAX(score) as bestScore, totalQuestions FROM quiz_results WHERE quizId = ? AND userId = ?',
              quiz.id,
              userId
            );

            if (bestScoreResult && bestScoreResult.bestScore !== null) {
              quiz.bestScore = Math.round((bestScoreResult.bestScore / bestScoreResult.totalQuestions) * 100);
            }
        }

        return quizzes;
    } catch (error) {
        console.error("Could not read quizzes from database:", error);
        return [];
    }
}

export default async function QuizPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const quizzes = await getQuizzes(user.id);

  return (
    <AppLayout user={user}>
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Quizzes</h1>
            <p className="text-muted-foreground">
                Select a quiz to test your cybersecurity knowledge.
            </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(quiz => (
                <Card key={quiz.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline">{quiz.title}</CardTitle>
                        <CardDescription>{quiz.questions.length} questions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                       {quiz.bestScore !== undefined ? (
                         <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-muted-foreground flex items-center gap-1.5"><Trophy className="h-4 w-4 text-yellow-500" /> Best Score</span>
                              <span className="font-bold">{quiz.bestScore}%</span>
                            </div>
                            <Progress value={quiz.bestScore} aria-label={`${quiz.title} best score ${quiz.bestScore}%`} />
                         </div>
                       ) : (
                         <p className="text-sm text-muted-foreground">You haven't taken this quiz yet.</p>
                       )}
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href={`/quiz/${quiz.id}`}>
                                {quiz.bestScore !== undefined ? 'Try Again' : 'Start Quiz'} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </AppLayout>
  );
}
