'use client';

import { useActionState, useState } from 'react';
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
import { AlertCircle, Check, X } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
      {pending ? 'Processing...' : mode === 'login' ? 'Login' : 'Create an account'}
    </Button>
  );
}

function PasswordStrength({ password }: { password: any }) {
    const checks = [
        { regex: /.{8,}/, message: 'At least 8 characters' },
        { regex: /[a-z]/, message: 'At least one lowercase letter' },
        { regex: /[A-Z]/, message: 'At least one uppercase letter' },
        { regex: /\d/, message: 'At least one number' },
        { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, message: 'At least one special character' },
    ];

    const satisfiedChecks = checks.filter(check => check.regex.test(password));
    const strength = satisfiedChecks.length;
    const strengthPercentage = (strength / checks.length) * 100;
    
    let strengthColor = 'bg-destructive';
    if (strengthPercentage >= 80) {
        strengthColor = 'bg-green-500';
    } else if (strengthPercentage >= 40) {
        strengthColor = 'bg-yellow-500';
    }

    if (!password) return null;

    return (
        <div className="space-y-2 pt-2">
            <Progress value={strengthPercentage} className={cn("h-1", strengthColor)} />
            <div className="space-y-1">
                {checks.map((check, index) => (
                    <div
                        key={index}
                        className={cn(
                            "text-xs flex items-center gap-2",
                            satisfiedChecks.some(c => c.message === check.message)
                                ? "text-green-600"
                                : "text-muted-foreground"
                        )}
                    >
                        {satisfiedChecks.some(c => c.message === check.message)
                            ? <Check className="h-3 w-3" />
                            : <X className="h-3 w-3" />
                        }
                        <span>{check.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}


export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === 'login' ? loginUser : registerUser;
  const [state, formAction] = useActionState(action, { error: null });
  const [password, setPassword] = useState('');


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
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                onChange={e => mode === 'register' && setPassword(e.target.value)}
              />
              {state?.error?.password && <p className="text-xs text-destructive">{state.error.password.join(' ')}</p>}
              {mode === 'register' && <PasswordStrength password={password} />}
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
