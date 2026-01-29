'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Loader2, Minus, Plus, ShoppingCart, Star, Heart } from 'lucide-react';
import { collection, query, where, limit, addDoc, serverTimestamp, doc, setDoc, deleteDoc, runTransaction } from 'firebase/firestore';

import type { Product, UserRating } from '@/lib/types';
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
import { useFirestore, useUser, useDoc } from '@/firebase';
import { cn } from '@/lib/utils';

type ProductPageProps = {
  params: {
    slug: string; // This is now the product ID
  };
};

const RatingInput = ({
  userRating,
  onRatingSubmit,
  isSubmitting,
}: {
  userRating: number;
  onRatingSubmit: (rating: number) => void;
  isSubmitting: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col items-start gap-2">
      <h3 className="text-lg font-semibold">
        {userRating > 0 ? 'Update Your Rating' : 'Rate this Product'}
      </h3>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingSubmit(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isSubmitting}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star
              className={cn(
                'h-7 w-7 transition-colors',
                (hoverRating || userRating) >= star
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
         {isSubmitting && <Loader2 className="h-5 w-5 animate-spin ml-2" />}
      </div>
    </div>
  );
};


export default function ProductPage({ params }: ProductPageProps) {
  const { slug: productId } = params;
  const { toast } = useToast();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const productRef = useMemo(() => {
    if (!firestore || !productId) return null;
    return doc(firestore, 'products', productId);
  }, [firestore, productId]);

  const { data: product, loading } = useDoc<Product>(productRef);

  const wishlistRef = useMemo(() => {
    if (!firestore || !user || !product) return null;
    return doc(firestore, `users/${user.uid}/wishlist`, product.id);
  }, [firestore, user, product]);

  const { data: wishlistItem, loading: loadingWishlist } = useDoc(wishlistRef);
  const isInWishlist = !!wishlistItem;

  const userRatingRef = useMemo(() => {
    if (!firestore || !user || !product) return null;
    return doc(firestore, `users/${user.uid}/ratedProducts`, product.id);
  }, [firestore, user, product]);

  const { data: userRatingDoc } = useDoc<UserRating>(userRatingRef);
  const currentUserRating = userRatingDoc?.rating || 0;


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

  const averageRating = product.reviews > 0 ? product.rating / product.reviews : 0;

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
      router.push(`/login?redirect=/product/${product.id}`);
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
      router.push(`/login?redirect=/product/${product.id}`);
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

  const handleRatingSubmit = async (newRating: number) => {
    if (!user || !firestore || !product) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }

    setIsRating(true);
    const productRef = doc(firestore, 'products', product.id);
    const userRatingRef = doc(firestore, `users/${user.uid}/ratedProducts`, product.id);

    try {
      await runTransaction(firestore, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        const userRatingDoc = await transaction.get(userRatingRef);

        if (!productDoc.exists()) {
          throw 'Product does not exist!';
        }

        const currentProductData = productDoc.data() as Product;
        const previousUserRating = userRatingDoc.exists() ? (userRatingDoc.data() as UserRating).rating : 0;

        const newTotalRating = currentProductData.rating - previousUserRating + newRating;
        const newReviewsCount = previousUserRating === 0 ? currentProductData.reviews + 1 : currentProductData.reviews;

        transaction.update(productRef, {
          rating: newTotalRating,
          reviews: newReviewsCount,
        });

        transaction.set(userRatingRef, { rating: newRating });
      });

      toast({
        title: 'Rating Submitted!',
        description: `You rated this product ${newRating} stars.`,
      });
    } catch (e: any) {
      console.error("Rating transaction failed: ", e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not submit your rating.',
      });
    } finally {
      setIsRating(false);
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
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
              <span className="font-bold text-foreground">{averageRating.toFixed(1)}</span>
              <span>({product.reviews} ratings)</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">{product.sales || 0}</span>
              <span>sold</span>
            </div>
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
          
          {user && (
            <>
              <RatingInput
                userRating={currentUserRating}
                onRatingSubmit={handleRatingSubmit}
                isSubmitting={isRating}
              />
              <Separator className="my-8" />
            </>
          )}


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

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
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
