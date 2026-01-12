
'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import type { User } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Wand2 } from 'lucide-react';
import { generateAndSaveQuiz } from '@/lib/actions/quiz.actions';

const topics = [
    'Phishing',
    'Social Engineering',
    'Malware & Ransomware',
    'Password Security',
    'Email Security',
    'Web Safety & Fake Websites',
    'Two-Factor Authentication (2FA)',
    'Identity Theft',
];

const difficulties = ['Easy', 'Medium', 'Hard', 'Very Hard'];

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
            <Wand2 className="mr-2 h-4 w-4" />
            {pending ? 'Generating Quiz...' : 'Generate Quiz'}
        </Button>
    );
}

export function QuizGenerator({ user }: { user: User }) {
    const router = useRouter();
    const [state, formAction] = useActionState(generateAndSaveQuiz, { error: null, quizId: null });

    useEffect(() => {
        if (state.quizId) {
            router.push(`/quiz/${state.quizId}`);
        }
    }, [state.quizId, router]);


    return (
         <Card className="w-full max-w-md">
            <form action={formAction}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Generate a New Quiz</CardTitle>
                    <CardDescription>Select a topic and difficulty to start a personalized quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {state.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="topic">Topic</Label>
                         <Select name="topic" defaultValue={topics[0]}>
                            <SelectTrigger id="topic">
                                <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map(topic => (
                                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select name="difficulty" defaultValue={difficulties[0]}>
                            <SelectTrigger id="difficulty">
                                <SelectValue placeholder="Select a difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {difficulties.map(diff => (
                                    <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <GenerateButton />
                </CardFooter>
            </form>
        </Card>
    );
}

