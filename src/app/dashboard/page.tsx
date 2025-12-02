
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
import { Bot, FileText, ArrowRight, ShieldCheck, Users, MessageSquare, BarChart3 } from 'lucide-react';
import type { QuizResult } from '@/lib/types';
import { getDb } from '@/lib/db';
import { ResultsChart } from '@/components/dashboard/ResultsChart';
import { OverallStats } from '@/components/dashboard/OverallStats';
import { ResultsTable } from '@/components/dashboard/ResultsTable';
import { AdminStats } from '@/components/dashboard/AdminStats';

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

async function getAdminDashboardData() {
  try {
    const db = await getDb();
    const [
      userCount,
      quizCount,
      resultCount,
      feedbackCount,
      recentResults,
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'),
      db.get('SELECT COUNT(*) as count FROM quizzes'),
      db.get('SELECT COUNT(*) as count FROM quiz_results'),
      db.get('SELECT COUNT(*) as count FROM quiz_feedback'),
      db.all<QuizResult[]>(`
        SELECT qr.*, q.title as quizTitle, u.name as userName
        FROM quiz_results qr
        JOIN quizzes q ON qr.quizId = q.id
        JOIN users u ON qr.userId = u.id
        ORDER BY qr.completedAt DESC
        LIMIT 5
      `),
    ]);

    return {
      stats: {
        users: userCount.count,
        quizzes: quizCount.count,
        results: resultCount.count,
        feedback: feedbackCount.count,
      },
      recentResults,
    };
  } catch (error) {
    console.error('Could not load admin dashboard data:', error);
    return {
      stats: { users: 0, quizzes: 0, results: 0, feedback: 0 },
      recentResults: [],
    };
  }
}


export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // User-facing features
  const features = [
    {
      title: 'Start Quiz',
      description: 'Test your cybersecurity knowledge.',
      href: '/quiz',
      icon: FileText,
    },
    {
      title: 'Talk to AI',
      description: 'Ask our AI anything about security.',
      href: '/chatbot',
      icon: Bot,
    },
  ];

  // Admin-facing action cards
  const adminFeatures = [
    {
      title: 'Manage Quizzes',
      description: 'Create, edit, and delete quizzes and questions.',
      href: '/admin/quizzes',
      icon: FileText,
    },
    {
      title: 'Manage Users',
      description: 'View, edit, and manage all user accounts.',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'View Feedback',
      description: 'See what users are saying about the quizzes.',
      href: '/admin/feedback',
      icon: MessageSquare,
    },
  ];

  const { recentResults, allResults } = user.isAdmin
    ? { recentResults: [], allResults: [] }
    : await getQuizResults(user.id);
    
  const adminData = user.isAdmin ? await getAdminDashboardData() : null;

  return (
    <AppLayout user={user}>
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {user.isAdmin ? 'Admin Dashboard' : `Welcome back, ${user.name}!`}
          </h1>
          <p className="text-muted-foreground">
            {user.isAdmin
              ? 'An overview of your application and activity.'
              : 'Ready to level up your cybersecurity skills?'}
          </p>
        </div>

        {user.isAdmin && adminData ? (
            // ADMIN DASHBOARD VIEW
            <div className="space-y-6">
                <AdminStats stats={adminData.stats} />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {adminFeatures.map(feature => (
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
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><BarChart3/> Recent Quiz Activity</CardTitle>
                        <CardDescription>
                            A log of the most recent quizzes taken by users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ResultsTable results={adminData.recentResults} isAdminView={true} />
                    </CardContent>
                </Card>
            </div>
        ) : (
            // USER DASHBOARD VIEW
            <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map(feature => (
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
                    ))}
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
                )}
            </>
        )}
      </div>
    </AppLayout>
  );
}
