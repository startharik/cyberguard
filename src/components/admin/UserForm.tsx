'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/lib/types';
import { updateUser } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  isAdmin: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm({ user }: { user: User }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      isAdmin: !!user.isAdmin,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setError(null);
    const formData = new FormData();
    formData.append('payload', JSON.stringify(data));
    formData.append('userId', user.id);
    
    try {
        const result = await updateUser(null, formData);
        if(result?.error) {
            const errorMessages = Object.values(result.error).flat().join(', ');
            setError(errorMessages || 'An unknown error occurred.');
        } else {
           router.push('/admin/users');
        }
    } catch (e) {
        setError('An unexpected error occurred.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
             {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
                id="isAdmin" 
                checked={watch('isAdmin')} 
                onCheckedChange={(checked) => setValue('isAdmin', checked)}
            />
            <Label htmlFor="isAdmin">Administrator</Label>
          </div>
        </CardContent>
      </Card>
      
       {error && (
          <div className="text-sm text-destructive mt-4">
            {error}
          </div>
       )}

      <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/users"><ArrowLeft className="mr-2 h-4 w-4" /> Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
      </div>
    </form>
  );
}
