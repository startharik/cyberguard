
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function ForgotPasswordPage() {
  return (
    <PublicLayout>
        <div className="flex items-center justify-center py-20">
            <ForgotPasswordForm />
        </div>
    </PublicLayout>
  )
}
