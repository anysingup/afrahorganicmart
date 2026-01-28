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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    if (!userLoading) {
      // If user is loaded, but is not an admin and not trying to login, redirect.
      if (!isAdmin && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      // If user is an admin and is on the login page, redirect to dashboard.
      if (isAdmin && pathname === '/admin/login') {
        router.push('/admin');
      }
    }
  }, [user, isAdmin, userLoading, router, pathname]);

  // Show a loader while user status is being determined.
  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is an admin and not on the login page, show the admin layout.
  if (isAdmin && pathname !== '/admin/login') {
    if (!isClient) {
      // Render a loader on the server and initial client render to avoid hydration mismatch
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

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

  // For non-admins, only show the content if it's the login page.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For any other case (e.g. non-admin trying to access a protected route while redirecting), show loader.
  return (
    <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
