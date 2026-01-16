
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

function ResetPasswordContents({ token }: { token: string | undefined }) {
    if (!token) {
        return (
            <Card className="w-full max-w-sm text-center">
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl">Invalid Token</CardTitle>
                    <CardDescription>The password reset link is invalid or has expired.</CardDescription>
                 </CardHeader>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/forgot-password">Request a new link</Link>
                    </Button>
                 </CardFooter>
            </Card>
        )
    }
    return <ResetPasswordForm token={token} />;
}


export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <PublicLayout>
        <div className="flex items-center justify-center py-20">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordContents token={searchParams.token} />
            </Suspense>
        </div>
    </PublicLayout>
  );
}
