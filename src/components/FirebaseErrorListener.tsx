'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.toContextObject());

      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: (
          <div className="text-xs">
            <p>You do not have permission to perform this action.</p>
            <details className="mt-2">
              <summary>Details</summary>
              <pre className="mt-1 text-xs bg-gray-800 text-white p-2 rounded">
                <code>{JSON.stringify(error.toContextObject(), null, 2)}</code>
              </pre>
            </details>
          </div>
        ),
      });

      // For developers, throw the error in development to show the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
