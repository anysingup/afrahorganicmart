'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

import { useFirestore, useCollection } from '@/firebase';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/shared/product-card';
import { categories } from '@/lib/data';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export default function CategoryPage({ params: { slug } }: CategoryPageProps) {
  const firestore = useFirestore();

  const category = useMemo(() => categories.find(c => c.slug === slug), [slug]);

  const productsQuery = useMemo(() => {
    if (!firestore || !category) return null;
    return query(
      collection(firestore, 'products'),
      where('category', '==', category.name),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, category]);
  
  const { data: products, loading } = useCollection<Product>(productsQuery);

  if (!loading && !category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">{category?.name || 'Category'}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Browse our collection of premium organic {category?.name.toLowerCase() || 'products'}.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No Products Found</h2>
          <p className="text-muted-foreground mt-2">
            There are currently no products in this category. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}
