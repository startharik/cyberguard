
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MailCheck } from 'lucide-react';
import { sendPasswordResetLink } from '@/lib/actions/auth.actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
      {pending ? 'Sending Link...' : 'Send Password Reset Link'}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(sendPasswordResetLink, { error: null, success: null });

  if (state.success) {
      return (
          <Card className="w-full max-w-sm">
             <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                     <MailCheck className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">Check Your Email</CardTitle>
             </CardHeader>
             <CardContent>
                <AlertDescription className="text-center">
                    {state.success}
                </AlertDescription>
             </CardContent>
             <CardFooter>
                 <Button asChild className="w-full">
                     <Link href="/login">Back to Login</Link>
                 </Button>
             </CardFooter>
          </Card>
      )
  }

  return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <SubmitButton />
             <Button variant="link" asChild>
                <Link href="/login">Back to Login</Link>
             </Button>
          </CardFooter>
        </form>
      </Card>
  );
}
