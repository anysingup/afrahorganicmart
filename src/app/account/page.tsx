'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Loader2, LogOut, ShoppingCart, Heart, User as UserIcon } from 'lucide-react';

import { useAuth, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AccountPage() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : <UserIcon />;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={profile?.photoURL || user.photoURL || undefined} alt={profile?.displayName || user.displayName || 'User'} />
                <AvatarFallback className="text-3xl">
                  {getInitials(profile?.displayName || user.displayName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-3xl font-headline">{profile?.displayName || user.displayName}</CardTitle>
            <CardDescription>{profile?.email || user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/cart"><ShoppingCart className="mr-2" /> My Cart</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/wishlist"><Heart className="mr-2" /> My Wishlist</Link>
              </Button>
            </div>
             <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="mr-2" /> Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
