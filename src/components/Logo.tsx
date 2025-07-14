import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sizes = {
    sm: {
      icon: 'h-6 w-6',
      text: 'text-xl',
    },
    md: {
      icon: 'h-8 w-8',
      text: 'text-2xl',
    },
  };
  return (
    <Link href="/dashboard" className="flex items-center gap-2 outline-none">
      <ShieldCheck className={`${sizes[size].icon} text-primary`} />
      <h1 className={`${sizes[size].text} font-bold font-headline text-primary`}>
        CyberGuardian
      </h1>
    </Link>
  );
}
