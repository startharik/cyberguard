import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
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
import { Award, Trophy, ShieldAlert, BookCheck, Sparkles } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';
import { generateQuizFeedback } from '@/ai/flows/feedback-flow';

async function AIFeedback({ score, total, quizTitle }: { score: number; total: number; quizTitle: string }) {
  // Don't generate feedback for perfect scores on short quizzes or for review sessions.
  if ((score === total && total < 5) || quizTitle.startsWith('Review')) {
    return null;
  }
  
  try {
    const result = await generateQuizFeedback({
        quizTitle,
        score,
        totalQuestions: total,
    });

    return (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-800">
          <p className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-600" /> AI Feedback</p>
          <p className="mt-1">{result.feedback}</p>
        </div>
    )
  } catch (error) {
    console.error("Failed to get AI feedback:", error);
    return null;
  }
}

function ResultsContent({ score, total, incorrectQuestionIds, quizId, quizTitle }: { score: number; total: number; incorrectQuestionIds: string; quizId: string, quizTitle: string }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const incorrectIds = JSON.parse(incorrectQuestionIds || '[]');
  
  let resultIcon, resultTitle, resultDescription, resultColorClass, resultBgClass;

  if (percentage === 100) {
    resultIcon = <Trophy className="h-16 w-16 text-yellow-500 mb-4" />;
    resultTitle = "Perfect Score!";
    resultDescription = "Outstanding! You're a cybersecurity pro.";
    resultColorClass = "text-yellow-700 font-semibold";
    resultBgClass = "bg-yellow-500/10";
  } else if (percentage >= 75) {
    resultIcon = <Award className="h-16 w-16 text-green-500 mb-4" />;
    resultTitle = "Great Job!";
    resultDescription = "Congratulations! You've passed the quiz.";
    resultColorClass = "text-green-700 font-semibold";
    resultBgClass = "bg-green-500/10";
  } else {
    resultIcon = <ShieldAlert className="h-16 w-16 text-destructive mb-4" />;
    resultTitle = "Almost There!";
    resultDescription = "Keep practicing to improve your security skills.";
    resultColorClass = "text-destructive font-semibold";
    resultBgClass = "bg-destructive/10";
  }


  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            {resultIcon}
          </div>
          <CardTitle className="font-headline text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            You scored {score} out of {total} ({percentage}%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className={`p-4 rounded-md ${resultBgClass}`}>
               <p className={`font-semibold ${resultColorClass}`}>{resultTitle}</p>
               <p className="text-sm text-muted-foreground mt-1">{resultDescription}</p>
           </div>

            <Suspense fallback={<div className="text-sm text-muted-foreground">Generating AI feedback...</div>}>
                <AIFeedback score={score} total={total} quizTitle={quizTitle} />
            </Suspense>

           <FeedbackForm quizId={quizId} />
        </CardContent>
        <CardFooter className="flex-col gap-4">
            {incorrectIds.length > 0 && (
                <Button asChild variant="secondary" className="w-full">
                    <Link href={`/quiz/review?questionIds=${JSON.stringify(incorrectIds)}`}>
                        <BookCheck className="mr-2 h-4 w-4" /> Practice Missed Questions ({incorrectIds.length})
                    </Link>
                </Button>
            )}
            <Button asChild className="w-full">
                <Link href="/quiz">Take Another Quiz</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function QuizResultsPageContents({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined }}) {
    const score = parseInt(searchParams?.score as string) || 0;
    const total = parseInt(searchParams?.total as string) || 0;
    const incorrectQuestionIds = (searchParams?.incorrectQuestionIds as string) || '[]';
    const quizId = (searchParams?.quizId as string) || '';
    const quizTitle = (searchParams?.quizTitle as string) || 'this quiz';


    return <ResultsContent score={score} total={total} incorrectQuestionIds={incorrectQuestionIds} quizId={quizId} quizTitle={quizTitle} />;
}


export default async function QuizResultsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined }}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AppLayout user={user}>
        <Suspense fallback={<div>Loading results...</div>}>
            <QuizResultsPageContents searchParams={searchParams} />
        </Suspense>
    </AppLayout>
  );
}
