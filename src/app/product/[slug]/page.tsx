'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Loader2, Minus, Plus, ShoppingCart, Star, Heart } from 'lucide-react';
import { collection, query, where, limit, addDoc, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';

import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const productQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), where('slug', '==', params.slug), limit(1));
  }, [firestore, params.slug]);

  const { data: productData, loading } = useCollection<Product>(productQuery);
  const product = productData?.[0];

  const wishlistRef = useMemo(() => {
    if (!firestore || !user || !product) return null;
    return doc(firestore, `users/${user.uid}/wishlist`, product.id);
  }, [firestore, user, product]);

  const { data: wishlistItem, loading: loadingWishlist } = useDoc(wishlistRef);
  const isInWishlist = !!wishlistItem;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

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

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Database not available' });
      return;
    }
    setIsAddingToCart(true);
    const cartRef = collection(firestore, `users/${user.uid}/cart`);
    try {
      await addDoc(cartRef, {
        productId: product.id,
        quantity: quantity,
        addedAt: serverTimestamp(),
      });
      toast({
        title: 'Added to cart!',
        description: `${product.name} (x${quantity}) has been added to your cart.`,
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add to cart.' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    if (!wishlistRef) return;

    if (isInWishlist) {
      await deleteDoc(wishlistRef);
      toast({ description: 'Removed from wishlist.' });
    } else {
      await setDoc(wishlistRef, {
        productId: product.id,
        addedAt: serverTimestamp(),
      });
      toast({ description: 'Added to wishlist.' });
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Left Column: Image Carousel */}
        <div className="flex flex-col items-center">
          <Carousel className="w-full max-w-md">
            <CarouselContent>
              {product.images.map((imageUrl, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square relative">
                    <Image
                      src={imageUrl}
                      alt={`${product.name} - image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Right Column: Product Info & Actions */}
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
            <p className="text-3xl font-bold text-primary">৳{product.price.toFixed(2)}</p>
            {product.originalPrice && (
              <p className="text-lg text-muted-foreground line-through">৳{product.originalPrice.toFixed(2)}</p>
            )}
          </div>

          <Separator className="my-8" />
          
          <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          
          <Separator className="my-8" />

          <div className="flex items-center gap-4">
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

          <div className="mt-8 flex gap-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={isAddingToCart || product.stock === 0}>
              {isAddingToCart ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-5 w-5" />
              )}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleWishlistToggle} disabled={loadingWishlist}>
              <Heart className={cn("mr-2 h-5 w-5", isInWishlist && "fill-destructive text-destructive")} />
              {isInWishlist ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
