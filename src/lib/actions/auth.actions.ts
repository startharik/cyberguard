'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import type { User } from '@/lib/types';

const usersPath = path.join(process.cwd(), 'data/users.json');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

async function getUsers(): Promise<User[]> {
  try {
    const usersData = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(usersData);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await fs.writeFile(usersPath, JSON.stringify([], null, 2));
      return [];
    }
    console.error('Failed to read users file:', error);
    return [];
  }
}

async function saveUsers(users: User[]) {
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}

export async function registerUser(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const users = await getUsers();
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
      return { error: { form: 'User with this email already exists' } };
    }

    // In a real app, hash the password!
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      isAdmin: users.length === 0, // First user is an admin, others are not.
    };

    users.push(newUser);
    await saveUsers(users);

  } catch (e) {
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
    const users = await getUsers();
    const user = users.find(u => u.email === email);

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
     return { error: { form: 'An unexpected error occurred. Please try again.' } };
  }

  redirect('/dashboard');
}

export async function logout() {
  cookies().delete('session-id');
  redirect('/login');
}
