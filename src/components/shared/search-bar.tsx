'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';

import { useFirestore } from '@/firebase';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';

export default function SearchBar() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchAllProducts = async () => {
    if (!firestore) return [];
    const productsRef = collection(firestore, 'products');
    const q = query(productsRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['allProducts'],
    queryFn: fetchAllProducts,
    enabled: !!firestore,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const filteredProducts = useMemo(() => {
    if (!searchQuery || !products) return [];
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // Limit to 5 results
  }, [searchQuery, products]);

  // Control popover visibility
  useEffect(() => {
    const shouldOpen = searchQuery.length > 1;
    if (shouldOpen !== isOpen) {
        setIsOpen(shouldOpen);
    }
  }, [searchQuery, isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            placeholder="Search for products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </PopoverAnchor>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        onOpenAutoFocus={(e) => e.preventDefault()} // prevent focus stealing
      >
        {isLoading && (
            <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        )}
        {filteredProducts.length > 0 ? (
          <div className="flex flex-col max-h-96 overflow-y-auto">
            {filteredProducts.map(product => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex items-center gap-4 p-2 hover:bg-accent"
                onClick={() => {
                    setSearchQuery('');
                    setIsOpen(false);
                }}
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{product.name}</p>
                  <p className="text-sm text-primary font-bold">৳{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !isLoading && (
            <p className="p-4 text-sm text-muted-foreground text-center">No products found.</p>
          )
        )}
      </PopoverContent>
    </Popover>
  );
}
