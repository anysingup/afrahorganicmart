import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';

import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const productImage = PlaceHolderImages.find(p => p.id === product.image);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <Card className={cn("group overflow-hidden relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1", className)}>
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/product/${product.slug}`} className="block">
            <div className="aspect-square w-full overflow-hidden">
               {productImage && (
                <Image
                  src={productImage.imageUrl}
                  alt={product.name}
                  data-ai-hint={productImage.imageHint}
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
          
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-background/70 rounded-full hover:bg-background">
            <Heart className="h-5 w-5 text-muted-foreground hover:text-destructive hover:fill-destructive" />
          </Button>
        </div>
        
        <div className="p-4 space-y-2">
           <p className="text-sm text-muted-foreground">{product.category}</p>
           <h3 className="font-semibold text-lg truncate" title={product.name}>
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
           </h3>
          
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-xl text-primary">৳{product.price}</p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">৳{product.originalPrice}</p>
            )}
          </div>

          <Button className="w-full" variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
