
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/lib/types';
import { getDb } from '@/lib/db';
import { sendPasswordResetEmail } from './email.actions';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
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

const emailSchema = z.string().email('Please enter a valid email address.');

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export async function registerUser(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, skillLevel } = validatedFields.data;

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
      skillLevel: skillLevel,
    };

    await db.run(
        'INSERT INTO users (id, name, email, password, isAdmin, skillLevel) VALUES (?, ?, ?, ?, ?, ?)',
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.isAdmin ? 1 : 0,
        newUser.skillLevel
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

export async function sendPasswordResetLink(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const validatedEmail = emailSchema.safeParse(email);

    if (!validatedEmail.success) {
        return { error: 'Please enter a valid email address.' };
    }

    try {
        const db = await getDb();
        const user = await db.get<User>('SELECT id, email FROM users WHERE email = ?', email);

        if (!user) {
            // To prevent user enumeration, we show a success message even if the user doesn't exist.
            return { success: 'If an account with that email exists, a password reset link has been sent.' };
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now

        await db.run(
            'UPDATE users SET resetToken = ?, resetTokenExpiresAt = ? WHERE id = ?',
            token,
            expiresAt.toISOString(),
            user.id
        );

        await sendPasswordResetEmail(user.email, token);

        return { success: 'If an account with that email exists, a password reset link has been sent.' };

    } catch (e) {
        console.error('Password reset error:', e);
        // Generic error message to prevent leaking information
        return { error: 'An unexpected error occurred. Please try again later.' };
    }
}


export async function resetPassword(prevState: any, formData: FormData) {
    const validatedFields = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
          error: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { token, password } = validatedFields.data;

    try {
        const db = await getDb();
        const user = await db.get<User>('SELECT * FROM users WHERE resetToken = ?', token);

        if (!user) {
            return { error: { form: 'Invalid reset token. Please try again.' } };
        }

        const now = new Date();
        const expiresAt = new Date(user.resetTokenExpiresAt!);
        if (now > expiresAt) {
            return { error: { form: 'Your password reset token has expired. Please request a new one.' } };
        }
        
        // In a real app, hash the password!
        await db.run(
            'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiresAt = NULL WHERE id = ?',
            password,
            user.id
        );
        
    } catch (e) {
        console.error('Reset password error:', e);
        return { error: { form: 'An unexpected error occurred. Please try again.' } };
    }

    redirect('/login?reset=success');
}
