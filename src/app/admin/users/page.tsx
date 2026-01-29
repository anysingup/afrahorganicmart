'use client';

import { useMemo, useState } from 'react';
import { collection, doc, setDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { Loader2, MoreHorizontal, UserCheck, UserX } from 'lucide-react';

import { useFirestore, useCollection, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminUser extends UserProfile {
    id: string; // This is the UID
    isAdmin: boolean;
}

export default function UsersPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser(); // to prevent an admin from removing their own admin rights
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const usersCollection = useMemo(() => (
    firestore ? collection(firestore, 'users') : null
  ), [firestore]);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersCollection);

  const adminsCollection = useMemo(() => (
    firestore ? collection(firestore, 'admins') : null
  ), [firestore]);
  const { data: admins, loading: loadingAdmins } = useCollection<DocumentData>(adminsCollection);

  const adminUids = useMemo(() => new Set(admins?.map(admin => admin.id)), [admins]);

  const combinedUsers = useMemo<AdminUser[]>(() => {
    if (!users) return [];
    return users.map(user => ({
      ...user,
      isAdmin: adminUids.has(user.id),
    }));
  }, [users, adminUids]);

  const loading = loadingUsers || loadingAdmins;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const nameParts = name.split(' ').filter(Boolean);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const toggleAdminStatus = async (userToUpdate: AdminUser) => {
    if (!firestore || isUpdating) return;

    setIsUpdating(userToUpdate.id);
    const adminRef = doc(firestore, 'admins', userToUpdate.id);
    const wasAdmin = userToUpdate.isAdmin;

    try {
      if (wasAdmin) {
        // Remove admin
        await deleteDoc(adminRef);
        toast({
          title: "Admin Removed",
          description: `${userToUpdate.displayName} is no longer an admin.`,
        });
      } else {
        // Make admin
        await setDoc(adminRef, { isAdmin: true });
        toast({
          title: "Admin Added",
          description: `${userToUpdate.displayName} is now an admin.`,
        });
      }
    } catch (error) {
      const permissionError = new FirestorePermissionError({
          path: adminRef.path,
          operation: wasAdmin ? 'delete' : 'write',
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View all users and manage admin roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedUsers && combinedUsers.length > 0 ? (
              combinedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <Avatar className="h-10 w-10 border">
                         <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
                         <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                       </Avatar>
                       <span className="font-medium">{user.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    { isUpdating === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                    ) : (
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.id === currentUser?.uid}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => toggleAdminStatus(user)}
                            className={user.isAdmin ? 'text-destructive focus:text-destructive' : ''}
                          >
                            {user.isAdmin ? (
                                <>
                                    <UserX className="mr-2 h-4 w-4"/> Remove Admin
                                </>
                            ) : (
                                <>
                                    <UserCheck className="mr-2 h-4 w-4"/> Make Admin
                                </>
                            )}
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
