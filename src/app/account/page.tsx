'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader2, LogOut, ShoppingCart, Heart, User as UserIcon, Package } from 'lucide-react';

import { useAuth, useUser, useFirestore, useCollection } from '@/firebase';
import type { Order } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AccountPage() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const ordersQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
    });
  }, [orders]);

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

  const getBadgeVariant = (status: Order['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Processing':
        return 'default';
      case 'Shipped':
        return 'outline';
      case 'Delivered':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
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
    if (!name) return '';
    const nameParts = name.split(' ').filter(Boolean);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const displayName = profile?.displayName || user.displayName;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={profile?.photoURL || user.photoURL || undefined} alt={displayName || 'User'} />
                <AvatarFallback className="text-3xl">
                  {displayName ? getInitials(displayName) : <UserIcon />}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-3xl font-headline">{displayName}</CardTitle>
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

        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>Here's a list of all your past orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {ordersLoading && (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {!ordersLoading && sortedOrders && sortedOrders.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {sortedOrders.map((order) => (
                            <AccordionItem value={order.id} key={order.id}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex justify-between items-center w-full pr-4 text-sm md:text-base">
                                        <div className="flex flex-col md:flex-row md:items-center md:gap-4 text-left">
                                            <span className="font-semibold">
                                                Order #{order.id.substring(0, 6)}...
                                            </span>
                                            <span className="text-xs md:text-sm text-muted-foreground">
                                                {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'PP') : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center md:gap-4 text-right md:text-left">
                                            <Badge variant={getBadgeVariant(order.status)} className="my-1 md:my-0">{order.status}</Badge>
                                            <span className="font-semibold text-primary">৳{order.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-md">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Items in this order:</h4>
                                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                            {order.items.map((item, index) => (
                                                <li key={index}>
                                                   <span className="font-medium text-foreground">{item.productName}</span> (x{item.quantity}) - ৳{(item.price * item.quantity).toFixed(2)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    !ordersLoading && (
                        <div className="text-center py-12 text-muted-foreground">
                             <Package className="mx-auto h-12 w-12" />
                            <p className="mt-4">You haven't placed any orders yet.</p>
                            <Button asChild variant="link" className="mt-2">
                                <Link href="/shop">Start Shopping</Link>
                            </Button>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
