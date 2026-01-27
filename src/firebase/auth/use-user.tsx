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
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !firestore) {
      if (!user) setLoading(false);
      return;
    }

    setLoading(true);
    const adminDocRef = doc(firestore, 'admins', user.uid);
    const profileDocRef = doc(firestore, 'users', user.uid);

    const unsubAdmin = onSnapshot(adminDocRef, (docSnap) => {
      setIsAdmin(docSnap.exists() && docSnap.data().isAdmin === true);
    }, (error) => {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    });

    const unsubProfile = onSnapshot(profileDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
       // We can set loading to false here as this is the 'main' user data
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setProfile(null);
      setLoading(false);
    });

    return () => {
        unsubAdmin();
        unsubProfile();
    };
  }, [user, firestore]);

  return useMemo(() => ({ user, profile, isAdmin, loading }), [user, profile, isAdmin, loading]);
};
