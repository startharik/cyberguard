import 'server-only';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import type { User } from './types';

const usersPath = path.join(process.cwd(), 'data/users.json');

async function getUsers(): Promise<User[]> {
  try {
    const usersData = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(usersData);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read users file:', error);
    return [];
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionId = cookies().get('session-id')?.value;
  if (!sessionId) return null;

  try {
    const users = await getUsers();
    const user = users.find(u => u.id === sessionId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
