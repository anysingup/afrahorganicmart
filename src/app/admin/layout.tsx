'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AdminNav from '@/components/shared/admin-nav';
import { Loader2 } from 'lucide-react';

// This component contains the actual layout logic, to be rendered only on the client.
function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect handles redirection after the auth state is resolved.
    if (!userLoading) {
      if (!isAdmin && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
      if (isAdmin && pathname === '/admin/login') {
        router.replace('/admin');
      }
    }
  }, [isAdmin, userLoading, router, pathname]);

  // While checking user auth, or during redirection, show a loader.
  if (userLoading || (!isAdmin && pathname !== '/admin/login')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is not an admin but is on the login page, show the login page.
  if (!isAdmin && pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If we reach here, the user is an admin and not on the login page.
  // So, render the full admin layout with sidebar.
  return (
    <SidebarProvider>
      <Sidebar>
        <AdminNav />
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="font-headline text-2xl font-bold">Admin Panel</h1>
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


// This is the main layout component exported.
// It ensures that the main logic only runs on the client-side to prevent hydration errors.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // When the component mounts on the client, set isClient to true.
    setIsClient(true);
  }, []);

  // On the server, and on the initial client render, just show a full-screen loader.
  // This guarantees that the server and client initial render are identical.
  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Once on the client, render the actual layout component which contains all the logic.
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
