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
    },
    {
      title: 'Talk to AI',
      description: 'Ask our AI anything about security.',
      href: '/chatbot',
      icon: Bot,
    },
    {
      title: 'Admin Panel',
      description: 'Manage quizzes, users, and settings.',
      href: '/admin/quizzes',
      icon: ShieldCheck,
      adminOnly: true,
    }
  ];

  return (
    <AppLayout user={user}>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground">
                Ready to level up your cybersecurity skills?
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {features.map((feature) => {
                if(feature.adminOnly && !user.isAdmin) return null;
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

         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Latest Quiz Results</CardTitle>
                <CardDescription>
                    Here's a summary of your recent quiz performance.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10 text-muted-foreground">
                <p>You haven't completed any quizzes yet.</p>
                <Button variant="link" asChild className="mt-2">
                    <Link href="/quiz">Start your first quiz</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
