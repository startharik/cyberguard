import Link from 'next/link';
import {
  Home,
  Bot,
  FileText,
  ShieldCheck,
  PanelLeft,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/Logo';
import { UserNav } from './UserNav';
import type { User } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/chatbot', icon: Bot, label: 'AI Chatbot' },
  { href: '/quiz', icon: FileText, label: 'Quizzes' },
];

const adminNavItems = [
    { href: '/admin/quizzes', label: 'Quiz Management' },
    { href: '/admin/users', label: 'User Management' },
    { href: '/admin/feedback', label: 'Quiz Feedback' },
];

export function AppLayout({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo size="sm" />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
               {user.isAdmin && (
                 <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline">
                         <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4" />
                            Admin
                         </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8">
                         <nav className="grid gap-1">
                            {adminNavItems.map(item => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs"
                                >
                                    {item.label}
                                </Link>
                            ))}
                         </nav>
                      </AccordionContent>
                    </AccordionItem>
                </Accordion>
              )}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 mb-4">
                   <Logo size="sm" />
                </div>
                {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
               {user.isAdmin && (
                <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline text-lg">
                         <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5" />
                            Admin
                         </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8">
                         <nav className="grid gap-1">
                            {adminNavItems.map(item => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-base"
                                >
                                    {item.label}
                                </Link>
                            ))}
                         </nav>
                      </AccordionContent>
                    </AccordionItem>
                </Accordion>
              )}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search bar here if needed */}
          </div>
          <UserNav user={user} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
        </main>
      </div>
    </div>
  );
}
