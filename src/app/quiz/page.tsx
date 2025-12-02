
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
import { ArrowRight, Trophy, Lock } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { getDb } from '@/lib/db';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


async function getQuizzes(userId: string): Promise<Quiz[]> {
    try {
        const db = await getDb();
        const quizzes = await db.all<Quiz[]>('SELECT * FROM quizzes');
        const userBestScores: { [quizId: string]: number } = {};

        // Pre-fetch all of the user's best scores
        const bestScoreResults = await db.all(
            'SELECT quizId, MAX(score * 100.0 / totalQuestions) as bestScore FROM quiz_results WHERE userId = ? GROUP BY quizId',
            userId
        );

        for (const result of bestScoreResults) {
            userBestScores[result.quizId] = Math.round(result.bestScore);
        }

        for (const quiz of quizzes) {
            const questions = await db.all('SELECT id FROM questions WHERE quizId = ?', quiz.id);
            quiz.questions = questions;

            quiz.bestScore = userBestScores[quiz.id] || undefined;
            
            // Check for prerequisites
            if (quiz.prerequisiteQuizId) {
                const prerequisiteBestScore = userBestScores[quiz.prerequisiteQuizId] || 0;
                if (prerequisiteBestScore < (quiz.prerequisiteScore || 100)) {
                    quiz.isLocked = true;
                    const prereqQuiz = await db.get('SELECT title FROM quizzes WHERE id = ?', quiz.prerequisiteQuizId);
                    quiz.prerequisiteQuizTitle = prereqQuiz?.title;
                }
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
        <TooltipProvider>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(quiz => (
                <Card key={quiz.id} className={`flex flex-col ${quiz.isLocked ? 'bg-muted/50' : ''}`}>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            {quiz.isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                            {quiz.title}
                        </CardTitle>
                        <CardDescription>{quiz.questions.length} questions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                       {quiz.bestScore !== undefined && !quiz.isLocked && (
                         <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-muted-foreground flex items-center gap-1.5"><Trophy className="h-4 w-4 text-yellow-500" /> Best Score</span>
                              <span className="font-bold">{quiz.bestScore}%</span>
                            </div>
                            <Progress value={quiz.bestScore} aria-label={`${quiz.title} best score ${quiz.bestScore}%`} />
                         </div>
                       )}
                       {quiz.isLocked ? (
                          <div className="text-sm text-muted-foreground text-center p-4 border-dashed border rounded-md">
                            Complete '{quiz.prerequisiteQuizTitle}' with a score of {quiz.prerequisiteScore}% or higher to unlock.
                          </div>
                       ) : quiz.bestScore === undefined && (
                         <p className="text-sm text-muted-foreground">You haven't taken this quiz yet.</p>
                       )}
                    </CardContent>
                    <CardFooter>
                        {quiz.isLocked ? (
                             <Tooltip>
                                <TooltipTrigger className="w-full">
                                    <Button disabled className="w-full">
                                        <Lock className="mr-2 h-4 w-4" /> Locked
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Complete '{quiz.prerequisiteQuizTitle}' to unlock.</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                             <Button asChild className="w-full">
                                <Link href={`/quiz/${quiz.id}`}>
                                    {quiz.bestScore !== undefined ? 'Try Again' : 'Start Quiz'} <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
        </TooltipProvider>
    </AppLayout>
  );
}
