
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import type { ContactMessage } from '@/lib/types';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const db = await getDb();
    const messages = await db.all<ContactMessage[]>(`
      SELECT id, name, email, message, submittedAt
      FROM contact_messages
      ORDER BY submittedAt DESC
    `);
    return messages;
  } catch (error) {
    console.error('Could not read contact messages from database:', error);
    return [];
  }
}

async function ContactMessagesContent() {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      redirect('/dashboard');
    }
  
    const messages = await getContactMessages();
  
    return (
      <AppLayout user={user}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-headline">Contact Messages</h1>
          <p className="text-muted-foreground">
            Messages submitted through the public contact form.
          </p>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>
              {messages.length > 0
                ? 'Here are the messages from your users.'
                : 'Your inbox is empty.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No messages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.email}</div>
                      </TableCell>
                      <TableCell className="max-w-sm whitespace-pre-wrap">{item.message}</TableCell>
                      <TableCell className="text-right">
                        {format(new Date(item.submittedAt), 'MMM d, yyyy, h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AppLayout>
    );
}

export default async function AdminContactMessagesPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return (
        <Suspense fallback={
            <AppLayout user={user}>
                 <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-headline">Contact Messages</h1>
                    <p className="text-muted-foreground">
                        Loading messages...
                    </p>
                </div>
            </AppLayout>
        }>
            <ContactMessagesContent />
        </Suspense>
    );
}
