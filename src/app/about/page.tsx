'use client';

import { siteConfig } from '@/lib/data';
import Image from 'next/image';
import { Target, Eye } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
    const aboutImage = PlaceHolderImages.find(p => p.id === "hero-banner");

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">About {siteConfig.name}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Your trusted source for pure, organic, and divinely delicious products.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
           {aboutImage && (
              <Image
                src={aboutImage.imageUrl}
                alt="Organic products"
                data-ai-hint={aboutImage.imageHint}
                fill
                className="object-cover"
              />
            )}
        </div>
        <div className="space-y-6">
          <h2 className="font-headline text-3xl font-bold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            {siteConfig.name} was born from a simple idea: to bring the purest and most natural products to every household in Bangladesh. We believe that good health starts with good food, and we are passionate about sourcing the finest organic ingredients from trusted farmers and suppliers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From the sun-kissed dates of the Middle East to the golden jaggery of our local fields, every product we offer is a testament to our commitment to quality, purity, and authenticity.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
         <div className="space-y-6 md:order-2">
          <h2 className="font-headline text-3xl font-bold">Our Mission & Vision</h2>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full mt-1">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Our Mission</h3>
              <p className="text-muted-foreground mt-1">
                To provide our customers with 100% pure, organic, and high-quality food products that promote a healthy and wholesome lifestyle, while ensuring fair trade practices with our farmers.
              </p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full mt-1">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Our Vision</h3>
              <p className="text-muted-foreground mt-1">
                To be the leading and most trusted brand for organic products in Bangladesh, known for our unwavering commitment to quality, purity, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
        <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg md:order-1">
            <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxvcmdhbmljJTIwZmFybWluZ3xlbnwwfHx8fDE3Njk1MDIwMzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Organic farming"
                data-ai-hint="organic farming"
                fill
                className="object-cover"
              />
        </div>
      </div>

    </div>
  );
}
