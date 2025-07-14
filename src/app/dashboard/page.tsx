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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import type { QuizResult } from '@/lib/types';
import { getDb } from '@/lib/db';
import { ResultsChart } from '@/components/dashboard/ResultsChart';
import { OverallStats } from '@/components/dashboard/OverallStats';
import { ResultsTable } from '@/components/dashboard/ResultsTable';

async function getQuizResults(
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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const features = [
    {
      title: 'Start Quiz',
      description: 'Test your cybersecurity knowledge.',
      href: '/quiz',
      icon: FileText,
      userOnly: true,
    },
    {
      title: 'Talk to AI',
      description: 'Ask our AI anything about security.',
      href: '/chatbot',
      icon: Bot,
      userOnly: true,
    },
    {
      title: 'Admin Panel',
      description: 'Manage quizzes, users, and settings.',
      href: '/admin/quizzes',
      icon: ShieldCheck,
      adminOnly: true,
    },
  ];

  const { recentResults, allResults } = user.isAdmin
    ? { recentResults: [], allResults: [] }
    : await getQuizResults(user.id);

  return (
    <AppLayout user={user}>
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {user.isAdmin ? 'Admin Dashboard' : `Welcome back, ${user.name}!`}
          </h1>
          <p className="text-muted-foreground">
            {user.isAdmin
              ? 'Manage your application content and users.'
              : 'Ready to level up your cybersecurity skills?'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => {
            if (feature.adminOnly && !user.isAdmin) return null;
            if (feature.userOnly && user.isAdmin) return null;
            return (
              <Card key={feature.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium font-headline">
                    {feature.title}
                  </CardTitle>
                  <feature.icon className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <Button asChild>
                    <Link href={feature.href}>
                      Go <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!user.isAdmin &&
          (allResults.length > 0 ? (
            <div className="space-y-6">
              <OverallStats results={allResults} />

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Recent Quiz Performance
                  </CardTitle>
                  <CardDescription>
                    Here's a summary of your last 5 quizzes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultsChart results={recentResults} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Quiz History</CardTitle>
                  <CardDescription>
                    A detailed log of all your completed quizzes.
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
                    <CardTitle className="font-headline">Your Statistics</CardTitle>
                    <CardDescription>
                        Complete a quiz to see your performance statistics.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                        <p>You haven't completed any quizzes yet.</p>
                        <Button variant="link" asChild className="mt-2">
                        <Link href="/quiz">Start your first quiz</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
          ))}
      </div>
    </AppLayout>
  );
}
