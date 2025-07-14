import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const GradientShield = ({ className }: { className: string }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#8A2BE2' }} />
        <stop offset="33%" style={{ stopColor: '#4169E1' }} />
        <stop offset="66%" style={{ stopColor: '#20B2AA' }} />
        <stop offset="100%" style={{ stopColor: '#3CB371' }} />
      </linearGradient>
    </defs>
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="url(#logo-gradient)"
    />
  </svg>
);


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
       <GradientShield className={sizes[size].icon} />
      <h1 className={`${sizes[size].text} font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] via-[#4169E1] to-[#20B2AA]`}>
        CyberGuardian
      </h1>
    </Link>
  );
}
