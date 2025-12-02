
'use client';

import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Quiz } from '@/lib/types';
import { createQuiz, updateQuiz } from '@/lib/actions/quiz.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Trash, PlusCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useActionState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required.'),
  options: z.array(z.string().min(1, 'Option text is required.')).min(2, 'At least two options are required.'),
  correctAnswer: z.string().min(1, 'Correct answer is required.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  questions: z.array(questionSchema).min(1, 'At least one question is required.'),
});

type QuizFormData = z.infer<typeof quizSchema>;

// New component to isolate the `useWatch` hook and prevent full-form re-renders.
function CorrectAnswerSelector({ control, questionIndex, register }: { control: Control<QuizFormData>, questionIndex: number, register: any }) {
    const options = useWatch({
      control,
      name: `questions.${questionIndex}.options`,
    });

    return (
        <select
            id={`questions.${questionIndex}.correctAnswer`}
            {...register(`questions.${questionIndex}.correctAnswer`)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <option value="">Select the correct answer</option>
            {options?.map((opt, i) => (
                opt && <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    );
}

export function QuizForm({ quiz }: { quiz?: Quiz }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const action = quiz ? updateQuiz : createQuiz;
  const [state, formAction, isPending] = useActionState(action, { error: null, isInitial: true });
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: quiz?.title || '',
      questions: quiz?.questions || [{ text: '', options: ['', ''], correctAnswer: '', difficulty: 'Easy' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });
  
  // This effect handles redirection after a successful action
  useEffect(() => {
    if (state && !state.isInitial && !state.error) {
      router.push('/admin/quizzes');
    }
  }, [state, router]);


  return (
    <form 
        ref={formRef}
        action={handleSubmit((data) => {
            const formData = new FormData();
            formData.append('payload', JSON.stringify(data));
            if (quiz) {
              formData.append('quizId', quiz.id);
            }
            formAction(formData);
        })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input id="title" {...register('title')} placeholder="e.g., Phishing 101" />
          </div>
        </CardContent>
      </Card>
      
      {fields.map((field, questionIndex) => {
        return (
          <Card key={field.id} className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Question {questionIndex + 1}</CardTitle>
                {errors.questions?.[questionIndex]?.text && <p className="text-sm text-destructive">{errors.questions[questionIndex]?.text?.message}</p>}
                {errors.questions?.[questionIndex]?.options && <p className="text-sm text-destructive">Each option is required.</p>}
                {errors.questions?.[questionIndex]?.correctAnswer && <p className="text-sm text-destructive">{errors.questions[questionIndex]?.correctAnswer?.message}</p>}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(questionIndex)}
                disabled={fields.length <= 1}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor={`questions.${questionIndex}.text`}>Question Text</Label>
                <Input
                  id={`questions.${questionIndex}.text`}
                  {...register(`questions.${questionIndex}.text`)}
                  placeholder="e.g., Which of these emails is a phishing attempt?"
                />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor={`questions.${questionIndex}.difficulty`}>Difficulty</Label>
                  <select
                      id={`questions.${questionIndex}.difficulty`}
                      {...register(`questions.${questionIndex}.difficulty`)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                  </select>
              </div>
              <div className="grid gap-2">
                <Label>Options</Label>
                {fields[questionIndex].options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      {...register(`questions.${questionIndex}.options.${optionIndex}`)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                  <Label htmlFor={`questions.${questionIndex}.correctAnswer`}>Correct Answer</Label>
                   <CorrectAnswerSelector 
                        control={control}
                        questionIndex={questionIndex}
                        register={register}
                   />
              </div>
            </CardContent>
          </Card>
        )
      })}

      <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ text: '', options: ['', ''], correctAnswer: '', difficulty: 'Easy' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
          </Button>
      </div>
      
       {state?.error?.form && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {state.error.form}
            </AlertDescription>
          </Alert>
       )}
       {state?.error?.fieldErrors && (
          <Alert variant="destructive" className="mt-4">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Validation Error</AlertTitle>
             <AlertDescription>
                Please check the form for errors.
             </AlertDescription>
          </Alert>
       )}


      <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/quizzes"><ArrowLeft className="mr-2 h-4 w-4" /> Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
             {isPending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
            {isPending ? 'Saving...' : 'Save Quiz'}
          </Button>
      </div>
    </form>
  );
}
