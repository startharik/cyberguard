
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ContactForm } from '@/components/contact/ContactForm';

export default function ContactPage() {
  return (
    <PublicLayout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <ContactForm />
        </div>
    </PublicLayout>
  );
}
