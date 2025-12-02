
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Terminal, AlertCircle } from 'lucide-react';
import { submitContactMessage } from '@/lib/actions/contact.actions';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Sending...' : 'Send Message'}
        </Button>
    );
}

export function ContactForm() {
    const [state, formAction] = useActionState(submitContactMessage, { success: false, message: '', errors: null });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state.success]);

    if (state.success) {
        return (
            <Card className="w-full max-w-2xl">
                 <CardHeader className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-3xl font-headline">Thank You!</CardTitle>
                 </CardHeader>
                 <CardContent className="text-center">
                    <p className="text-muted-foreground">{state.message}</p>
                     <Button asChild className="mt-6">
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                 </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl">
            <form action={formAction} ref={formRef}>
                <CardHeader className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
                    <CardDescription>Have a question or feedback? We'd love to hear from you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {state.message && !state.success && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="Your Name" />
                             {state.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="Your Email Address" />
                             {state.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" name="message" placeholder="Your message..." rows={6} />
                        {state.errors?.message && <p className="text-xs text-destructive">{state.errors.message[0]}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    );
}
