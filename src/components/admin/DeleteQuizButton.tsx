
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { deleteQuiz } from '@/lib/actions/quiz.actions';
import { Trash2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>}
        {pending ? 'Deleting...' : 'Delete'}
      </Button>
    </AlertDialogAction>
  );
}

export function DeleteQuizButton({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={async (formData) => {
            await deleteQuiz(formData);
            setOpen(false);
        }}>
          <input type="hidden" name="quizId" value={quizId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              quiz and all of its associated questions and results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
