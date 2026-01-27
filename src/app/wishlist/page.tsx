'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';

import { useFirestore, useUser } from '@/firebase';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const fetchWishlistProducts = async () => {
    if (!firestore || !user) return [];

    const wishlistRef = collection(firestore, `users/${user.uid}/wishlist`);
    const wishlistSnapshot = await getDocs(wishlistRef);
    const productIds = wishlistSnapshot.docs.map(doc => doc.id);

    if (productIds.length === 0) return [];

    const productsRef = collection(firestore, 'products');
    const productsQuery = query(productsRef, where('__name__', 'in', productIds));
    const productsSnapshot = await getDocs(productsQuery);
    
    return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
  };

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['wishlist', user?.uid],
    queryFn: fetchWishlistProducts,
    enabled: !!firestore && !!user,
  });


  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Your collection of favorite products.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : isError ? (
         <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">Error loading wishlist</h2>
          <p className="text-muted-foreground mt-2">Please try again later.</p>
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mt-4">Your wishlist is empty</h2>
          <p className="text-muted-foreground mt-2">
            Start adding products you love to see them here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
