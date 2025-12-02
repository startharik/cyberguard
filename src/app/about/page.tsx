
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
            <ShieldCheck className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                About CyberGuardian
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                Our mission is to demystify cybersecurity and empower everyone to stay safe online.
            </p>
        </div>
        <div className="max-w-2xl mx-auto space-y-6 text-lg text-muted-foreground">
            <p>
                In today's digital world, understanding cybersecurity is no longer optional—it's essential. From personal data to corporate secrets, the need for digital protection has never been greater. However, the topic is often seen as complex, intimidating, and inaccessible to the average person.
            </p>
            <p>
                CyberGuardian was created to bridge this gap. We believe that cybersecurity education should be accessible, engaging, and practical for everyone, regardless of their technical background.
            </p>
            <p>
                Our platform combines interactive, gamified quizzes with a friendly AI-powered chatbot to create a unique and effective learning experience. You can test your knowledge, learn from your mistakes in a safe environment, and get clear, simple answers to your questions anytime you need them.
            </p>
            <p>
                Whether you're a student, a professional, or just someone who wants to be more secure online, CyberGuardian is here to help you build the skills and confidence you need to navigate the digital landscape safely.
            </p>
        </div>
      </div>
    </PublicLayout>
  );
}
