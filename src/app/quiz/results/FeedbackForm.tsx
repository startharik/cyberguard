'use client';

import { useActionState, useRef, useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { submitFeedback } from '@/lib/actions/quiz.actions';
import { useFormStatus } from 'react-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
            {pending ? 'Submitting...' : 'Submit Feedback'}
        </Button>
    );
}

export function FeedbackForm({ quizId }: { quizId: string }) {
    const [state, formAction] = useActionState(submitFeedback, { error: null, success: null });
    const formRef = useRef<HTMLFormElement>(null);
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        if (state.success) {
            setShowForm(false);
        }
    }, [state.success]);

    if (!showForm) {
        return (
            <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700">
                <Terminal className="h-4 w-4 !text-green-700" />
                <AlertDescription>
                    {state.success}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-4 text-left pt-4">
            <h3 className="font-semibold">How was the quiz?</h3>
            <form 
                ref={formRef} 
                action={formAction} 
                className="space-y-4"
            >
                <input type="hidden" name="quizId" value={quizId} />
                <div className="grid w-full gap-2">
                    <Label htmlFor="feedback">Your Feedback</Label>
                    <Textarea placeholder="Tell us what you think..." id="feedback" name="feedback" />
                </div>
                {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
                <SubmitButton />
            </form>
        </div>
    );
}
