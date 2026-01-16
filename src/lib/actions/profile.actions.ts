'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
});

export async function updateUserProfile(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: { form: 'You must be logged in to update your profile.' } };
  }

  const validatedFields = profileUpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, skillLevel } = validatedFields.data;
  
  try {
    const db = await getDb();
    await db.run(
        'UPDATE users SET name = ?, skillLevel = ? WHERE id = ?',
        name,
        skillLevel,
        user.id
    );
  } catch (e) {
     console.error(e);
     return { error: { form: 'An unexpected error occurred. Please try again.' } };
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile/edit');
  redirect('/dashboard');
}
