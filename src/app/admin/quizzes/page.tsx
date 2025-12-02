
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import type { Quiz } from '@/lib/types';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteQuiz } from '@/lib/actions/quiz.actions';

async function getQuizzes(): Promise<Quiz[]> {
  try {
    const db = await getDb();
    const quizzes = await db.all('SELECT id, title FROM quizzes');

    for (const quiz of quizzes) {
      const questions = await db.all(
        'SELECT id FROM questions WHERE quizId = ?',
        quiz.id
      );
      quiz.questionCount = questions.length;
    }

    return quizzes;
  } catch (error) {
    console.error('Could not read quizzes from database:', error);
    return [];
  }
}

export default async function AdminQuizzesPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect('/dashboard');
  }

  const quizzes = await getQuizzes();

  return (
    <AppLayout user={user}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-headline">Quiz Management</h1>
          <p className="text-muted-foreground">
            Create, update, and manage quizzes.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quizzes/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Quizzes</CardTitle>
          <CardDescription>A list of all quizzes in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No quizzes found.
                  </TableCell>
                </TableRow>
              ) : (
                quizzes.map(quiz => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.questionCount}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <form action={deleteQuiz} className="w-full">
                            <input type="hidden" name="quizId" value={quiz.id} />
                            <button type="submit" className="w-full">
                                <DropdownMenuItem>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </button>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
