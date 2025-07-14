import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, User as UserIcon } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/types';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteUser } from '@/lib/actions/user.actions';
import { Badge } from '@/components/ui/badge';
import { SearchUsers } from '@/components/admin/SearchUsers';

async function getUsers(query: string): Promise<User[]> {
  try {
    const db = await getDb();
    let users;
    if (query) {
      users = await db.all<User[]>(
        "SELECT id, name, email, isAdmin FROM users WHERE name LIKE ? OR email LIKE ?",
        `%${query}%`,
        `%${query}%`
      );
    } else {
      users = await db.all<User[]>("SELECT id, name, email, isAdmin FROM users");
    }
    
    return users.map(u => ({ ...u, isAdmin: !!u.isAdmin }));
  } catch (error) {
    console.error('Could not read users from database:', error);
    return [];
  }
}

export default async function AdminUsersPage({ searchParams }: { searchParams?: { query?: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect('/dashboard');
  }

  const query = searchParams?.query || '';
  const users = await getUsers(query);

  return (
    <AppLayout user={user}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-headline">User Management</h1>
          <p className="text-muted-foreground">
            View, update, and manage users.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <SearchUsers />
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                        <Badge variant={u.isAdmin ? "default" : "secondary"}>
                           {u.isAdmin ? 'Admin' : 'User'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${u.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                           {user.id !== u.id && ( // Prevent admin from deleting themselves
                             <form action={deleteUser}>
                                <input type="hidden" name="userId" value={u.id} />
                                <button type="submit" className="w-full">
                                  <DropdownMenuItem>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                  </DropdownMenuItem>
                                </button>
                            </form>
                           )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
