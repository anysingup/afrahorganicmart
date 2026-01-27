'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, Star, Truck, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

import { useFirestore, useCollection } from '@/firebase';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProductCard from '@/components/shared/product-card';
import { categories, testimonials, siteConfig } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroBanner = PlaceHolderImages.find(p => p.id === "hero-banner");
  const specialOfferImg = PlaceHolderImages.find(p => p.id === "special-offer");
  
  const firestore = useFirestore();
  
  const bestSellersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('sales', 'desc'), limit(4));
  }, [firestore]);
  
  
  const { data: bestSellingProducts, loading: loadingBestSellers } = useCollection<Product>(bestSellersQuery);

  return (
    <div className="flex flex-col gap-12 md:gap-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        {heroBanner && (
          <Image
            src={heroBanner.imageUrl}
            alt={heroBanner.description}
            data-ai-hint={heroBanner.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Pure, Organic, Divine.
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90">
            Discover the finest selection of organic products, delivered from nature to your doorstep.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Link href="/shop">Shop Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">Shop by Category</h2>
          <p className="text-muted-foreground mt-2">Explore our wide range of organic goods.</p>
        </div>
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category) => {
              const categoryImage = PlaceHolderImages.find(p => p.id === category.image);
              return (
                <CarouselItem key={category.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 pl-2 md:pl-4">
                  <Link href={`/category/${category.slug}`} className="group text-center">
                    <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 border-2 border-transparent hover:border-primary">
                      <CardContent className="p-0">
                        {categoryImage && (
                            <Image
                            src={categoryImage.imageUrl}
                            alt={category.name}
                            data-ai-hint={categoryImage.imageHint}
                            width={200}
                            height={200}
                            className="aspect-square w-full object-cover"
                          />
                        )}
                      </CardContent>
                    </Card>
                    <h3 className="mt-2 font-semibold text-base truncate group-hover:text-primary">{category.name}</h3>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>
      
      {/* Best Selling Products */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Best Sellers</h2>
          <p className="text-muted-foreground mt-2">Loved by our customers, chosen by nature.</p>
        </div>
        {loadingBestSellers ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellingProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
           <Button asChild variant="outline" size="lg">
            <Link href="/shop">View All Products <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
      
      {/* Special Offer Section */}
      <section className="bg-secondary/50 py-12 md:py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Limited Time Offer</h3>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mt-2">Get 20% Off On Premium Ajwa Dates</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Experience the divine taste of authentic Ajwa dates. A perfect blend of taste and health benefits.
            </p>
            <div className="flex items-center gap-4 mt-6 justify-center md:justify-start">
              <span className="text-3xl font-bold text-accent">৳1200</span>
              <span className="text-xl text-muted-foreground line-through">৳1500</span>
            </div>
             <Button asChild size="lg" className="mt-8">
              <Link href="/shop">Shop Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
            {specialOfferImg && (
              <Image
                src={specialOfferImg.imageUrl}
                alt="Special Offer on Ajwa Dates"
                data-ai-hint={specialOfferImg.imageHint}
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>
      </section>

      {/* Our Qualities Section */}
      <section className="container mx-auto px-4 text-center">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Leaf className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-headline text-xl font-bold mt-4">100% Organic</h3>
              <p className="text-muted-foreground mt-2">All our products are sourced from trusted organic farms.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Truck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-headline text-xl font-bold mt-4">Fast Delivery</h3>
              <p className="text-muted-foreground mt-2">Get your fresh products delivered to your door quickly.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-headline text-xl font-bold mt-4">Quality Assured</h3>
              <p className="text-muted-foreground mt-2">We ensure the highest quality standards for all items.</p>
            </div>
         </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-card py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
            <p className="text-muted-foreground mt-2">Their happiness is our pride.</p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => {
                const avatarImg = PlaceHolderImages.find(p => p.id === testimonial.avatar);
                return (
                  <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col justify-between">
                        <CardContent className="p-6 text-center flex flex-col items-center">
                          <div className="flex mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                          <p className="italic text-muted-foreground mb-6">"{testimonial.quote}"</p>
                          <div className="flex items-center">
                            {avatarImg && (
                              <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={avatarImg.imageUrl} alt={testimonial.name} data-ai-hint={avatarImg.imageHint} />
                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className="font-bold">{testimonial.name}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="ml-12" />
            <CarouselNext className="mr-12" />
          </Carousel>
        </div>
      </section>
    </div>
  );
}
