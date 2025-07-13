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
import { ShieldAlert } from 'lucide-react';

export default async function AdminQuizzesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  if (!user.isAdmin) {
    redirect('/dashboard');
  }

  return (
    <AppLayout user={user}>
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
                    <ShieldAlert className="h-6 w-6" /> Admin: Quiz Management
                </CardTitle>
                <CardDescription>
                    This is a placeholder for the quiz management interface.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">
                   The interface for admins to create, update, and delete quizzes is under development. Quizzes are currently managed via the `data/quizzes.json` file.
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
