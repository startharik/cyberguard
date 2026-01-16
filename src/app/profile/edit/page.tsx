import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { EditProfileForm } from '@/components/profile/EditProfileForm';

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AppLayout user={user}>
      <div className="flex items-center justify-center">
        <EditProfileForm user={user} />
      </div>
    </AppLayout>
  );
}
