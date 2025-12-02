import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import type { QuizFeedback } from '@/lib/types';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

async function getFeedback(): Promise<QuizFeedback[]> {
  try {
    const db = await getDb();
    const feedback = await db.all<QuizFeedback[]>(`
      SELECT 
        qf.id,
        qf.feedback,
        qf.submittedAt,
        u.name as userName,
        u.email as userEmail,
        q.title as quizTitle
      FROM quiz_feedback qf
      JOIN users u ON qf.userId = u.id
      JOIN quizzes q ON qf.quizId = q.id
      ORDER BY qf.submittedAt DESC
    `);
    return feedback;
  } catch (error) {
    console.error('Could not read feedback from database:', error);
    return [];
  }
}

async function FeedbackContent() {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      redirect('/dashboard');
    }
  
    const feedback = await getFeedback();
  
    return (
      <AppLayout user={user}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-headline">Quiz Feedback</h1>
          <p className="text-muted-foreground">
            A log of all feedback submitted by users for quizzes.
          </p>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>User Feedback</CardTitle>
            <CardDescription>
              {feedback.length > 0
                ? 'Here is what users are saying about your quizzes.'
                : 'No feedback has been submitted yet.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No feedback found.
                    </TableCell>
                  </TableRow>
                ) : (
                  feedback.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.quizTitle}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.userName}</div>
                        <div className="text-xs text-muted-foreground">{item.userEmail}</div>
                      </TableCell>
                      <TableCell className="max-w-sm whitespace-pre-wrap">{item.feedback}</TableCell>
                      <TableCell className="text-right">
                        {format(new Date(item.submittedAt), 'MMM d, yyyy, h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AppLayout>
    );
}

export default async function AdminFeedbackPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return (
        <Suspense fallback={
            <AppLayout user={user}>
                 <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-headline">Quiz Feedback</h1>
                    <p className="text-muted-foreground">
                        Loading feedback...
                    </p>
                </div>
            </AppLayout>
        }>
            <FeedbackContent />
        </Suspense>
    )
}
