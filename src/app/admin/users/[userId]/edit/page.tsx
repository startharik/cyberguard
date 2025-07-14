import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { UserForm } from '@/components/admin/UserForm';

async function getUserById(id: string): Promise<User | undefined> {
  try {
    const db = await getDb();
    const userData = await db.get<User>('SELECT id, name, email, isAdmin FROM users WHERE id = ?', id);
    if (!userData) {
      return undefined;
    }
     return { ...userData, isAdmin: !!userData.isAdmin };
  } catch (error) {
    console.error('Could not read user from database:', error);
    return undefined;
  }
}

export default async function EditUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const adminUser = await getCurrentUser();
  if (!adminUser?.isAdmin) {
    redirect('/dashboard');
  }

  const user = await getUserById(params.userId);
  if (!user) {
    redirect('/admin/users');
  }

  return (
    <AppLayout user={adminUser}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-headline">Edit User</h1>
        <p className="text-muted-foreground">
          Update the user details below.
        </p>
      </div>
      <UserForm user={user} />
    </AppLayout>
  );
}
