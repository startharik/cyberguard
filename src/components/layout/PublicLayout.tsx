
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="mr-4 flex">
            <Logo size="sm" />
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
             <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
             </Button>
             <Button asChild>
                <Link href="/register">Sign Up</Link>
             </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="py-6 md:px-8 md:py-0 border-t bg-muted/20">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by CyberGuardian. The source code is available on GitHub.
            </p>
        </div>
      </footer>
    </div>
  );
}
