'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useUser } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AdminNav from '@/components/shared/admin-nav';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) {
      // If the user hook is still loading, we wait.
      setLoading(true);
      return;
    }
    
    // Handle user not being logged in
    if (!user) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      } else {
        // We are on the login page, so it's not a loading state anymore for the layout
        setLoading(false);
        setIsAuthorized(false);
      }
      return;
    }
    
    // Handle logged-in user who is not an admin
    if (!isAdmin) {
      router.push('/');
      return;
    }

    // If we reach here, user is an admin
    setIsAuthorized(true);
    setLoading(false);

  }, [user, isAdmin, userLoading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If on login page, just show the login page content
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If authorized, show the admin layout
  if (isAuthorized) {
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

  // Fallback for any other case (e.g. redirecting)
  return null;
}
