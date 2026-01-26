'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';

import { useAuth, useFirestore } from '@/firebase/provider';

interface UserHook {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export const useUser = (): UserHook => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !firestore) {
      // If there's no user, loading is finished for the admin check.
      if (!user) setLoading(false);
      return;
    }

    setLoading(true);
    const adminDocRef = doc(firestore, 'admins', user.uid);

    const unsubscribeSnapshot = onSnapshot(adminDocRef, (docSnap) => {
      setIsAdmin(docSnap.exists() && docSnap.data().isAdmin === true);
      setLoading(false);
    }, (error) => {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user, firestore]);

  return useMemo(() => ({ user, isAdmin, loading }), [user, isAdmin, loading]);
};
