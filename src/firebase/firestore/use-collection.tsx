'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  limit,
  orderBy,
  Query,
  DocumentData,
  CollectionReference,
} from 'firebase/firestore';

interface UseCollectionReturn<T> {
  data: (T & { id: string })[] | null;
  loading: boolean;
  error: Error | null;
}

export const useCollection = <T extends DocumentData>(
  ref: Query | CollectionReference | null
): UseCollectionReturn<T> => {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
        setLoading(false);
        return;
    };
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const result: (T & { id: string })[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...(doc.data() as T) });
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error in useCollection:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
};
