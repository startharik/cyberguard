'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { User } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUserProfile } from '@/lib/actions/profile.actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function EditProfileForm({ user }: { user: User }) {
  const [state, formAction] = useActionState(updateUserProfile, { error: null });

  return (
    <Card className="w-full max-w-2xl">
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Edit Profile</CardTitle>
          <CardDescription>Update your personal information below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {state?.error?.form && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error.form}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
            <p className="text-xs text-muted-foreground">You cannot change your email address.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={user.name} />
            {state?.error?.name && <p className="text-xs text-destructive">{state.error.name[0]}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="skillLevel">Cybersecurity Skill Level</Label>
            <Select name="skillLevel" defaultValue={user.skillLevel || 'Beginner'}>
              <SelectTrigger id="skillLevel">
                <SelectValue placeholder="Select your skill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner (Just starting out)</SelectItem>
                <SelectItem value="Intermediate">Intermediate (Know the basics)</SelectItem>
                <SelectItem value="Advanced">Advanced (Comfortable with technical topics)</SelectItem>
                <SelectItem value="Expert">Expert (Cybersecurity professional)</SelectItem>
              </SelectContent>
            </Select>
            {state?.error?.skillLevel && <p className="text-xs text-destructive">{state.error.skillLevel[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
