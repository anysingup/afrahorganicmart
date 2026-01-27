'use client';

import { useMemo } from 'react';
import { doc } from "firebase/firestore";
import { useFirestore, useDoc } from "@/firebase";
import { ProductForm } from "../../product-form";
import { Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";

type EditProductPageProps = {
    params: {
        id: string;
    };
};

export default function EditProductPage({ params: { id } }: EditProductPageProps) {
    const firestore = useFirestore();
    const productRef = useMemo(() => (
        firestore ? doc(firestore, "products", id) : null
    ), [firestore, id]);
    const { data: product, loading } = useDoc<Product>(productRef);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return <div className="text-center py-12">Product not found.</div>;
    }

    return <ProductForm initialData={product} />;
}
