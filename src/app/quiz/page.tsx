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
import { ArrowRight } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { getDb } from '@/lib/db';


async function getQuizzes(): Promise<Quiz[]> {
    try {
        const db = await getDb();
        const quizzes = await db.all('SELECT id, title FROM quizzes');
        
        for (const quiz of quizzes) {
            const questions = await db.all('SELECT id FROM questions WHERE quizId = ?', quiz.id);
            quiz.questions = questions; // just need the count, so this is fine
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

  const quizzes = await getQuizzes();

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
                <Card key={quiz.id}>
                    <CardHeader>
                        <CardTitle className="font-headline">{quiz.title}</CardTitle>
                        <CardDescription>{quiz.questions.length} questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">Ready to start?</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href={`/quiz/${quiz.id}`}>
                                Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </AppLayout>
  );
}
