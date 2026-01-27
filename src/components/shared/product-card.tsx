'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Loader2, Star } from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { useMemo, useState } from 'react';

import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const wishlistRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}/wishlist`, product.id);
  }, [firestore, user, product.id]);

  const { data: wishlistItem, loading: loadingWishlist } = useDoc(wishlistRef);
  const isInWishlist = !!wishlistItem;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/shop');
      return;
    }
    if (!wishlistRef) return;

    try {
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
    } catch (error) {
      toast({ variant: "destructive", title: "Something went wrong." });
    }
  };
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/shop');
      return;
    }
    if (!firestore) return;

    setIsAddingToCart(true);
    const cartRef = collection(firestore, `users/${user.uid}/cart`);
    try {
      await addDoc(cartRef, {
        productId: product.id,
        quantity: 1,
        addedAt: serverTimestamp(),
      });
      toast({
        title: 'Added to cart!',
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Could not add to cart.' });
    } finally {
      setIsAddingToCart(false);
    }
  };


  return (
    <Card className={cn("group overflow-hidden relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1", className)}>
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/product/${product.slug}`} className="block">
            <div className="aspect-square w-full overflow-hidden bg-muted">
               {firstImage && (
                <Image
                  src={firstImage}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
               )}
            </div>
          </Link>
          
          <div className="absolute top-3 left-3 flex flex-col gap-1">
             {hasDiscount && (
              <Badge variant="destructive">SALE</Badge>
            )}
            {product.isNew && (
              <Badge>NEW</Badge>
            )}
          </div>
          
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-background/70 rounded-full hover:bg-background" onClick={handleWishlistToggle} disabled={loadingWishlist}>
            <Heart className={cn("h-5 w-5 text-muted-foreground hover:text-destructive", isInWishlist && 'fill-destructive text-destructive')} />
             <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
        
        <div className="p-4 space-y-2">
           <p className="text-sm text-muted-foreground">{product.category}</p>
           <h3 className="font-semibold text-lg truncate" title={product.name}>
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
           </h3>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">
                {product.reviews > 0 ? (product.rating / product.reviews).toFixed(1) : 'New'}
                </span>
                <span>({product.reviews} reviews)</span>
            </div>
          
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-xl text-primary">৳{product.price}</p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">৳{product.originalPrice}</p>
            )}
          </div>

          <Button className="w-full" variant="outline" onClick={handleAddToCart} disabled={isAddingToCart || product.stock === 0}>
            {isAddingToCart ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
