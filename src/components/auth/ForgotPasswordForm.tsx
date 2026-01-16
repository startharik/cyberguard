
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
import { AlertCircle } from 'lucide-react';
import { sendPasswordResetCode } from '@/lib/actions/auth.actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
      {pending ? 'Sending Code...' : 'Send Password Reset Code'}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(sendPasswordResetCode, { error: null });

  return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a 6-digit code to reset your password.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
            {state?.error && (
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
