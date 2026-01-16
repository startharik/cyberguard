
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Suspense } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ResetPasswordContents({ email }: { email: string | undefined }) {
    if (!email) {
        return (
            <Card className="w-full max-w-sm text-center">
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl">Invalid Request</CardTitle>
                    <CardDescription>No email was provided. Please start the password reset process again.</CardDescription>
                 </CardHeader>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/forgot-password">Request a new code</Link>
                    </Button>
                 </CardFooter>
            </Card>
        )
    }
    return <ResetPasswordForm email={email} />;
}


export default function ResetPasswordPage({ searchParams }: { searchParams: { email?: string } }) {
  return (
    <PublicLayout>
        <div className="flex items-center justify-center py-20">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordContents email={searchParams.email} />
            </Suspense>
        </div>
    </PublicLayout>
  );
}
