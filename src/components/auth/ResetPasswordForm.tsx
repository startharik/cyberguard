
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
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
import { AlertCircle, Check, X } from 'lucide-react';
import { resetPassword } from '@/lib/actions/auth.actions';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
      {pending ? 'Resetting Password...' : 'Reset Password'}
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

export function ResetPasswordForm({ email }: { email: string }) {
    const router = useRouter();
    const [state, formAction] = useActionState(resetPassword, { error: null });
    const [password, setPassword] = useState('');

  return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            A code was sent to <span className="font-medium">{email}</span>. Please enter it below.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
             <input type="hidden" name="email" value={email} />
            {state?.error?.form && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{Array.isArray(state.error.form) ? state.error.form.join(' ') : state.error.form}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="token">Reset Code (OTP)</Label>
              <Input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
              />
              {state?.error?.token && <p className="text-xs text-destructive">{state.error.token[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              {state?.error?.password && <p className="text-xs text-destructive">{state.error.password[0]}</p>}
               <PasswordStrength password={password} />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
  );
}
