
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import type { QuizResult, User } from '@/lib/types';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResultsChart } from '@/components/dashboard/ResultsChart';
import { OverallStats } from '@/components/dashboard/OverallStats';
import { ResultsTable } from '@/components/dashboard/ResultsTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getUserById(id: string): Promise<User | undefined> {
  try {
    const db = await getDb();
    const userData = await db.get<User>('SELECT id, name, email FROM users WHERE id = ?', id);
    return userData;
  } catch (error) {
    console.error('Could not read user from database:', error);
    return undefined;
  }
}


async function getQuizResultsForUser(
  userId: string
): Promise<{ recentResults: QuizResult[]; allResults: QuizResult[] }> {
  try {
    const db = await getDb();
    const allResults = await db.all<QuizResult[]>(
      `SELECT qr.*, q.title as quizTitle 
       FROM quiz_results qr
       JOIN quizzes q ON qr.quizId = q.id
       WHERE qr.userId = ?
       ORDER BY qr.completedAt DESC`,
      userId
    );

    const recentResults = allResults.slice(0, 5);

    return { recentResults, allResults };
  } catch (error) {
    console.error('Could not read quiz results from database:', error);
    return { recentResults: [], allResults: [] };
  }
}

export default async function UserProgressPage({
  params,
}: {
  params: { userId: string };
}) {
  const adminUser = await getCurrentUser();
  if (!adminUser?.isAdmin) {
    redirect('/dashboard');
  }

  const user = await getUserById(params.userId);
  if (!user) {
    redirect('/admin/users');
  }

  const { recentResults, allResults } = await getQuizResultsForUser(user.id);

  return (
    <AppLayout user={adminUser}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                User Progress: {user.name}
            </h1>
            <p className="text-muted-foreground">
                Viewing quiz statistics for {user.email}.
            </p>
            </div>
            <Button variant="outline" asChild>
                <Link href="/admin/users"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Users</Link>
            </Button>
        </div>
        
        {allResults.length > 0 ? (
          <div className="space-y-6">
            <OverallStats results={allResults} />

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  Recent Quiz Performance
                </CardTitle>
                <CardDescription>
                  A summary of the user's last 5 quizzes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsChart results={recentResults} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Full Quiz History</CardTitle>
                <CardDescription>
                  A detailed log of all quizzes completed by this user.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsTable results={allResults} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">No Data Available</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                      <p>This user has not completed any quizzes yet.</p>
                  </div>
              </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
