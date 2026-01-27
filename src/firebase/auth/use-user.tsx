'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';

import { useAuth, useFirestore } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';

interface UserHook {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
}

export const useUser = (): UserHook => {
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        const profileDocRef = doc(firestore, 'users', authUser.uid);
        const adminDocRef = doc(firestore, 'admins', authUser.uid);

        const unsubProfile = onSnapshot(profileDocRef, (docSnap) => {
          setProfile(docSnap.exists() ? (docSnap.data() as UserProfile) : null);
          // Don't set loading to false here, wait for admin status.
        });

        const unsubAdmin = onSnapshot(adminDocRef, (docSnap) => {
          setIsAdmin(docSnap.exists() && docSnap.data().isAdmin === true);
          // Now that we have both profile and admin status for the logged-in user, we can stop loading.
          setLoading(false);
        }, (error) => {
           console.error("Error checking admin status:", error);
           setIsAdmin(false);
           setLoading(false); // Also stop loading on error
        });

        return () => {
          unsubProfile();
          unsubAdmin();
        };

      } else {
        // User is logged out
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return useMemo(() => ({ user, profile, isAdmin, loading }), [user, profile, isAdmin, loading]);
};
