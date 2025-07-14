import 'server-only';
import { cookies } from 'next/headers';
import type { User } from './types';
import { getDb } from './db';

export async function getCurrentUser(): Promise<User | null> {
  const sessionId = cookies().get('session-id')?.value;
  if (!sessionId) return null;

  try {
    const db = await getDb();
    const user = await db.get<User>('SELECT id, name, email, isAdmin FROM users WHERE id = ?', sessionId);
    
    if (user) {
      // The boolean from SQLite will be 0 or 1, so we convert it.
      return { ...user, isAdmin: !!user.isAdmin };
    }
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
