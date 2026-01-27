'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShoppingCart, Trash2, Send } from 'lucide-react';

import { useFirestore, useUser } from '@/firebase';
import type { Product, CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  phone: z.string().regex(/^01[3-9]\d{8}$/, { message: 'Please enter a valid Bangladeshi mobile number.' }),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'rocket'], {
    required_error: 'You need to select a payment method.',
  }),
});

interface CartProduct extends Product {
  quantity: number;
  cartItemId: string;
}

export default function CartPage() {
  const firestore = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCartItems = async (): Promise<CartProduct[]> => {
    if (!firestore || !user) return [];

    const cartRef = collection(firestore, `users/${user.uid}/cart`);
    const cartSnapshot = await getDocs(cartRef);
    const cartItems = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (CartItem & {id: string})[];
    
    if (cartItems.length === 0) return [];

    const productIds = cartItems.map(item => item.productId);
    const productsRef = collection(firestore, 'products');
    const productsQuery = query(productsRef, where('__name__', 'in', productIds));
    const productsSnapshot = await getDocs(productsQuery);
    const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    
    return cartItems.map(item => {
      const product = productsData.find(p => p.id === item.productId);
      return { ...product!, quantity: item.quantity, cartItemId: item.id };
    });
  };

  const { data: cartProducts, isLoading } = useQuery({
    queryKey: ['cart', user?.uid],
    queryFn: fetchCartItems,
    enabled: !!firestore && !!user,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.displayName || '',
      address: '',
      phone: '',
      paymentMethod: 'cod',
    },
  });

  const total = useMemo(() => {
    return cartProducts?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  }, [cartProducts]);

  const deleteMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!firestore || !user) throw new Error("Not authenticated");
      await deleteDoc(doc(firestore, `users/${user.uid}/cart`, cartItemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.uid] });
      toast({ title: 'Item removed from cart.' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error removing item.' });
    }
  });
  
  async function onSubmit(data: z.infer<typeof formSchema>) {
     if (!firestore || !user || !cartProducts || cartProducts.length === 0) {
      toast({ variant: "destructive", title: "Your cart is empty or something went wrong."});
      return;
    }
    setIsSubmitting(true);

    const ordersCollection = collection(firestore, 'orders');
    
    const orderPromises = cartProducts.map(item => {
        const orderDetails = {
          productName: item.name,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          customerName: data.name,
          address: data.address,
          phone: data.phone,
          paymentMethod: data.paymentMethod,
          status: 'Pending' as const,
          createdAt: serverTimestamp(),
          userId: user.uid,
        };
        return addDoc(ordersCollection, orderDetails).catch(e => {
            const permissionError = new FirestorePermissionError({
                path: 'orders',
                operation: 'create',
                requestResourceData: orderDetails,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw e; // re-throw to be caught by Promise.all
        });
    });

    try {
        await Promise.all(orderPromises);

        // Clear the cart
        const batch = writeBatch(firestore);
        cartProducts.forEach(item => {
            const docRef = doc(firestore, `users/${user.uid}/cart`, item.cartItemId);
            batch.delete(docRef);
        });
        await batch.commit();

        toast({
            title: 'Order Placed!',
            description: "We've received your orders and will process them shortly.",
        });
        form.reset();
        queryClient.invalidateQueries({ queryKey: ['cart', user?.uid] });

    } catch (error) {
        // Error toast is handled by the emitter
    } finally {
        setIsSubmitting(false);
    }
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mt-4">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
       <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Shopping Cart</h1>
      </div>
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-4">
            {cartProducts.map(item => (
                <Card key={item.id} className="flex items-center p-4">
                    <Image src={item.images[0]} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                    <div className="ml-4 flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm font-bold">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.cartItemId)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </Card>
            ))}
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary & Checkout</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>৳{total.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>৳{total.toFixed(2)}</span>
                    </div>
                </div>
                <Separator className="my-6" />
                <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl><Textarea placeholder="Your full delivery address" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl><Input placeholder="e.g., 01xxxxxxxxx" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="cod" /></FormControl>
                              <FormLabel className="font-normal">Cash on Delivery</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="bkash" /></FormControl>
                              <FormLabel className="font-normal">bKash</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                        Place Order
                    </Button>
                </form>
                </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
