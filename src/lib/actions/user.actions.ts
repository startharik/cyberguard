'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';

const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  isAdmin: z.boolean(),
});


export async function updateUser(prevState: any, formData: FormData) {
  const userId = formData.get('userId') as string;
  const parsedData = JSON.parse(formData.get('payload') as string);
  const validatedFields = userUpdateSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten(),
    };
  }

  if (!userId) {
    return { error: { formErrors: ['User ID is missing.'] } };
  }

  const { name, email, isAdmin } = validatedFields.data;
  
  try {
    const db = await getDb();
    
    const existingUser = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', email, userId);
    if (existingUser) {
        return { error: { formErrors: ['Another user with this email already exists.'] } };
    }

    await db.run(
        'UPDATE users SET name = ?, email = ?, isAdmin = ? WHERE id = ?',
        name,
        email,
        isAdmin ? 1 : 0,
        userId
    );
  } catch (e) {
     console.error(e);
     return { error: { formErrors: ['An unexpected error occurred. Please try again.'] } };
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function deleteUser(formData: FormData) {
    const userId = formData.get('userId') as string;

    if (!userId) {
        throw new Error('User ID is required for deletion.');
    }

    try {
        const db = await getDb();
        // Here you might want to add checks, e.g., an admin can't delete themselves.
        // For simplicity, we'll allow it but it's not recommended in a real app.
        await db.run('DELETE FROM users WHERE id = ?', userId);
    } catch (e) {
        console.error(e);
        throw new Error('Failed to delete user.');
    }

    revalidatePath('/admin/users');
    redirect('/admin/users');
}
