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

export default async function QuizResultsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AppLayout user={user}>
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Quiz Complete!</CardTitle>
                <CardDescription>
                    This is a placeholder for your quiz results.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">
                    The full quiz functionality, including scoring and results tracking, is under development.
                </p>
                <Button asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
