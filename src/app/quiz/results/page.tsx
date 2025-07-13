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
import { Award, CheckCircle, XCircle } from 'lucide-react';

function ResultsContent({ score, total }: { score: number; total: number }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isPass = percentage >= 75;

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            {isPass ? (
              <Award className="h-16 w-16 text-green-500 mb-4" />
            ) : (
              <Award className="h-16 w-16 text-destructive mb-4" />
            )}
          </div>
          <CardTitle className="font-headline text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            You scored {score} out of {total} ({percentage}%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPass ? (
             <div className="p-4 bg-green-500/10 rounded-md">
                 <p className="font-semibold text-green-700">Congratulations! You passed.</p>
             </div>
          ) : (
             <div className="p-4 bg-destructive/10 rounded-md">
                <p className="font-semibold text-destructive">Keep practicing to improve your score!</p>
             </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button asChild>
                <Link href="/quiz">Take Another Quiz</Link>
            </Button>
            <Button asChild variant="outline">
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

    return <ResultsContent score={score} total={total} />;
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
