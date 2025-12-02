'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/lib/types';
import { getDb } from '@/lib/db';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/\d/, 'Password must contain at least one number.')
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Password must contain at least one special character.'
    ),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function registerUser(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const db = await getDb();
    
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (existingUser) {
      return { error: { form: 'User with this email already exists' } };
    }
    
    const userCountResult = await db.get('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.count;

    // In a real app, hash the password!
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      isAdmin: userCount === 0, // First user is an admin
    };

    await db.run(
        'INSERT INTO users (id, name, email, password, isAdmin) VALUES (?, ?, ?, ?, ?)',
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.isAdmin ? 1 : 0
    );

  } catch (e) {
    console.error(e);
    return { error: { form: 'An unexpected error occurred. Please try again.' } };
  }

  redirect('/login');
}

export async function loginUser(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const db = await getDb();
    const user = await db.get<User>('SELECT * FROM users WHERE email = ?', email);

    if (!user || user.password !== password) {
      return { error: { form: 'Invalid email or password' } };
    }

    cookies().set('session-id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
  } catch (e) {
     console.error(e);
     return { error: { form: 'An unexpected error occurred. Please try again.' } };
  }

  redirect('/dashboard');
}

export async function logout() {
  cookies().delete('session-id');
  redirect('/login');
}
