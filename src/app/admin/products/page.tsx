'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Products</CardTitle>
          <CardDescription>View, add, and edit your store's products.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
               <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => {
                 const productImage = PlaceHolderImages.find(p => p.id === product.images[0]);
                 return (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      {productImage ? (
                        <Image
                          src={productImage.imageUrl}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-md" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">৳{product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {product.stock}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        {/* This will eventually link to /admin/products/edit/[id] */}
                        <Link href="#"> 
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                 )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
