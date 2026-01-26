'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


import { products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  phone: z.string().regex(/^01[3-9]\d{8}$/, { message: 'Please enter a valid Bangladeshi mobile number.' }),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'rocket'], {
    required_error: 'You need to select a payment method.',
  }),
});

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { toast } = useToast();
  const product = products.find((p) => p.slug === params.slug);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      paymentMethod: 'cod',
    },
  });

  if (!product) {
    notFound();
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (newQuantity > product.stock) return product.stock;
      return newQuantity;
    });
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Database service not available.",
        description: "Please try again later.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const totalPrice = product.price * quantity;
      const orderDetails = {
        productName: product.name,
        quantity: quantity,
        totalPrice: totalPrice,
        customerName: data.name,
        address: data.address,
        phone: data.phone,
        paymentMethod: data.paymentMethod,
        status: 'Pending',
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
      };

      const ordersCollection = collection(firestore, 'orders');
      await addDoc(ordersCollection, orderDetails);

      toast({
        title: 'Order Placed!',
        description: "We've received your order and will process it shortly.",
      });
      form.reset();
      setQuantity(1);

    } catch (e: any) {
      console.error("Order submission failed", e);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: e.message || "Could not place your order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Left Column: Image Carousel */}
        <div className="flex flex-col items-center">
            <Carousel className="w-full max-w-md">
                <CarouselContent>
                {product.images.map((imgId, index) => {
                    const productImage = PlaceHolderImages.find(p => p.id === imgId);
                    return (
                    <CarouselItem key={index}>
                        <div className="aspect-square relative">
                        {productImage && (
                            <Image
                                src={productImage.imageUrl}
                                alt={`${product.name} - image ${index + 1}`}
                                data-ai-hint={productImage.imageHint}
                                fill
                                className="object-cover rounded-lg"
                            />
                        )}
                        </div>
                    </CarouselItem>
                    );
                })}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </div>

        {/* Right Column: Product Info & Order Form */}
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-muted-foreground">{product.reviews} reviews</span>
          </div>
          
          <div className="mt-6">
            <p className="text-3xl font-bold text-primary">৳{product.price * quantity}</p>
            {product.originalPrice && (
              <p className="text-lg text-muted-foreground line-through">৳{product.originalPrice * quantity}</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <h3 className="text-lg font-semibold">Quantity:</h3>
            <div className="flex items-center gap-2 rounded-md border">
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">({product.stock} in stock)</p>
          </div>

          <Separator className="my-8" />

          <h2 className="font-headline text-2xl font-bold">Place Your Order</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your full delivery address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 01xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="cod" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Cash on Delivery
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="bkash" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            bKash
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="nagad" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Nagad
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="rocket" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Rocket
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                 {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Place Order
                    </>
                  )}
              </Button>
            </form>
          </Form>

        </div>
      </div>
    </div>
  );
}
