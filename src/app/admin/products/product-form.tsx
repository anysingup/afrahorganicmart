'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Product } from '@/lib/types';
import { categories } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  originalPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0, { message: 'Stock must be a positive number.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  images: z.string().min(10, { message: 'Please provide at least one valid image URL.' }),
  isNew: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product;
}

const createSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      originalPrice: initialData?.originalPrice || undefined,
      stock: initialData?.stock || 0,
      category: initialData?.category || '',
      images: initialData?.images.join('\n') || '',
      isNew: initialData?.isNew || false,
    },
  });

  const handleSuccess = (productName: string, isUpdate: boolean) => {
    toast({ 
        title: isUpdate ? 'Product Updated' : 'Product Created', 
        description: `"${productName}" has been ${isUpdate ? 'updated' : 'created'}.` 
    });
    router.push('/admin/products');
    router.refresh();
  }

  const handleError = (error: any, data: any, isUpdate: boolean) => {
    const permissionError = new FirestorePermissionError({
        path: isUpdate && initialData ? `products/${initialData.id}` : 'products',
        operation: isUpdate ? 'update' : 'create',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  }

  const onSubmit = async (data: ProductFormValues) => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Database service not available." });
        return;
    }
    
    setIsSubmitting(true);
    const slug = createSlug(data.name);
    const images = data.images.split('\n').map(s => s.trim()).filter(Boolean);

    const productData = {
        ...data,
        slug,
        images,
        rating: initialData?.rating ?? 0,
        reviews: initialData?.reviews ?? 0,
        sales: initialData?.sales ?? 0,
        updatedAt: serverTimestamp(),
    };

    if (initialData) {
        // Update existing product
        const productRef = doc(firestore, 'products', initialData.id);
        updateDoc(productRef, productData)
            .then(() => handleSuccess(data.name, true))
            .catch((e) => handleError(e, productData, true))
            .finally(() => setIsSubmitting(false));
    } else {
        // Create new product
        const productsCollection = collection(firestore, 'products');
        const newProductData = { ...productData, createdAt: serverTimestamp() };
        addDoc(productsCollection, newProductData)
            .then(() => handleSuccess(data.name, false))
            .catch((e) => handleError(e, newProductData, false))
            .finally(() => setIsSubmitting(false));
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>{initialData ? 'Edit Product' : 'Add New Product'}</CardTitle>
            <CardDescription>Fill in the details below to {initialData ? 'update the' : 'add a new'} product.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Premium Ajwa Dates" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe the product..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (৳)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="99.99" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="originalPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Original Price (৳) (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="120.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="100" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Image URLs</FormLabel>
                                <FormControl>
                                    <Textarea rows={4} placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Enter one image URL per line. The first image will be the main display image. You can add multiple URLs for a carousel.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isNew"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>New Arrival</FormLabel>
                                    <FormDescription>
                                        Mark this product as a new arrival on the homepage.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                         <Button type="button" variant="outline" onClick={() => router.back()}>
                           <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {initialData ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
