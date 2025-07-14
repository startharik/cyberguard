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

async function getQuizResults(userId: string): Promise<QuizResult[]> {
    try {
        const db = await getDb();
        const results = await db.all<QuizResult[]>(
            `SELECT qr.*, q.title as quizTitle 
             FROM quiz_results qr
             JOIN quizzes q ON qr.quizId = q.id
             WHERE qr.userId = ?
             ORDER BY qr.completedAt DESC
             LIMIT 5`,
            userId
        );
        return results;
    } catch (error) {
        console.error("Could not read quiz results from database:", error);
        return [];
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
    }
  ];
  
  const quizResults = user.isAdmin ? [] : await getQuizResults(user.id);

  return (
    <AppLayout user={user}>
      <div className="flex flex-col gap-4">
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
             {features.map((feature) => {
                if(feature.adminOnly && !user.isAdmin) return null;
                if(feature.userOnly && user.isAdmin) return null;
                return (
                    <Card key={feature.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium font-headline">
                                {feature.title}
                            </CardTitle>
                            <feature.icon className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
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
        
        {!user.isAdmin && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Latest Quiz Results</CardTitle>
                    <CardDescription>
                        Here's a summary of your recent quiz performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {quizResults.length > 0 ? (
                        <ResultsChart results={quizResults} />
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>You haven't completed any quizzes yet.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/quiz">Start your first quiz</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
