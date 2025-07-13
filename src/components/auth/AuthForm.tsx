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
import { loginUser, registerUser } from '@/lib/actions/auth.actions';
import { Logo } from '@/components/Logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type Mode = 'login' | 'register';

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Processing...' : mode === 'login' ? 'Login' : 'Create an account'}
    </Button>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === 'login' ? loginUser : registerUser;
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-2xl">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Enter your email below to login to your account'
              : 'Enter your information to create an account'}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
            {state?.error?.form && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error.form}</AlertDescription>
              </Alert>
            )}
            {mode === 'register' && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
                 {state?.error?.name && <p className="text-xs text-destructive">{state.error.name[0]}</p>}
              </div>
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
              {state?.error?.email && <p className="text-xs text-destructive">{state.error.email[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state?.error?.password && <p className="text-xs text-destructive">{state.error.password[0]}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton mode={mode} />
            {mode === 'login' ? (
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="underline">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Login
                </Link>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
