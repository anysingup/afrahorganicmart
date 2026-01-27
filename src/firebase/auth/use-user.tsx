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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true); // Start as true

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // User is logged in, now listen for profile and admin status.
        // We set loading to true until we have all the user info.
        setLoading(true);
        setUser(authUser);
        
        const profileDocRef = doc(firestore, 'users', authUser.uid);
        const adminDocRef = doc(firestore, 'admins', authUser.uid);

        const unsubProfile = onSnapshot(profileDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          // We have the profile info (or know it doesn't exist), so we can stop loading.
          setLoading(false); 
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setProfile(null);
          setLoading(false);
        });

        const unsubAdmin = onSnapshot(adminDocRef, (docSnap) => {
          setIsAdmin(docSnap.exists() && docSnap.data().isAdmin === true);
        }, (error) => {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        });

        // Return a cleanup function to unsubscribe from profile and admin listeners
        // when the user logs out or the component unmounts.
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
