'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, Firestore } from 'firebase/firestore';

import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AdminNav from '@/components/shared/admin-nav';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) {
      return;
    }
    if (!user) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
      return;
    }

    const checkAdminStatus = async (db: Firestore, uid: string) => {
      const adminDocRef = doc(db, 'admins', uid);
      const adminDocSnap = await getDoc(adminDocRef);
      if (adminDocSnap.exists() && adminDocSnap.data().isAdmin === true) {
        setIsAdmin(true);
      } else {
        // If not an admin, redirect to home.
        router.push('/');
      }
      setLoading(false);
    };

    if (firestore && user) {
      checkAdminStatus(firestore, user.uid);
    }

  }, [user, userLoading, firestore, router, pathname]);

  if (loading || userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && pathname !== '/admin/login') {
     return null; // The redirect is already in progress
  }
  
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAdmin) {
    return (
      <SidebarProvider>
        <Sidebar>
          <AdminNav />
        </Sidebar>
        <SidebarInset>
           <div className="p-4 md:p-6">
             <div className="flex items-center gap-4 mb-6">
                <SidebarTrigger className="md:hidden"/>
                <h1 className="font-headline text-2xl font-bold">Admin Panel</h1>
             </div>
             {children}
            </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return null; // Or a 'Not Authorized' page
}
