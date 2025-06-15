
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { LogoIcon } from '@/components/icons/logo';
import { UserNav } from '@/components/shared/user-nav';
import { MainNav } from '@/components/shared/main-nav';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';

// Defaulting to Kinyarwanda as per general direction
const t = (enText: string, knText: string) => knText;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // MOCK AUTHENTICATION STATE:
  // This is now the central point for the MOCK frontend authentication state.
  // In a real app, this would come from a context/store updated after API login.
  // For this prototype, to "log in", a developer would manually change this to true
  // and potentially set a mock user role for MainNav to filter correctly.
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to NOT authenticated
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 

  useEffect(() => {
    setIsClient(true);
    // Simulate an initial auth check. Since there's no backend or persistent session,
    // it will always resolve to the initial `isAuthenticated` state (false).
    const checkAuth = async () => {
      // In a real app: await api.checkSession();
      // For prototype:
      // setIsAuthenticated(false); // Already set by default
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isClient && !isLoadingAuth && !isAuthenticated) {
      const allowedPaths = ['/welcome', '/login', '/register', '/admin/login'];
      // If not authenticated and trying to access a path not in allowedPaths, redirect to /welcome.
      // The root path '/' is also considered part of the "welcome" flow if unauthenticated.
      if (!allowedPaths.includes(pathname) && pathname !== '/') {
        console.log(`AppLayout: Unauthenticated. Redirecting from "${pathname}" to /welcome.`);
        router.replace('/welcome');
      }
    }
  }, [isClient, isLoadingAuth, isAuthenticated, pathname, router]);

  if (isLoadingAuth && isClient) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('Gutegereza igenzura ry\'uburenganzira...', 'Gutegereza igenzura ry\'uburenganzira...')}</p>
      </div>
    );
  }
  
  // This covers the case where redirection might be pending after the initial auth check.
  const allowedPathsForUnauthenticated = ['/welcome', '/login', '/register', '/admin/login'];
  if (!isAuthenticated && !allowedPathsForUnauthenticated.includes(pathname) && pathname !== '/' && isClient) {
      return (
           <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('Kuyobora...', 'Kuyobora...')}</p>
          </div>
      );
  }
  
  // Determine if the full layout (with sidebar, header) should be rendered.
  // For unauthenticated users, only specific paths (welcome, login, etc.) should potentially bypass parts of the full layout
  // or be rendered directly. For this prototype, we show the full layout if authenticated or if on an allowed "public" page.
  // Root path '/' will be handled by its own page logic or the redirect if unauthenticated.
  const isPublicFlowPage = allowedPathsForUnauthenticated.includes(pathname) || pathname === '/';

  if (!isAuthenticated && !isPublicFlowPage && isClient) {
     // Fallback if redirection hasn't caught it yet, should be rare.
     return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  // The `UserNav` and `MainNav` components now directly receive the `isAuthenticated` state.
  // `MainNav` will use this to filter which navigation items are visible.
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" side="left" className="border-r">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors group">
            <LogoIcon className="h-8 w-8" />
            <h1 className="text-xl font-bold truncate font-headline">MediServe Hub</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <MainNav isAuthenticated={isAuthenticated} /> {/* Pass auth state */}
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
           <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" 
            onClick={() => alert(t('Amabwiriza y\'Ubuzima Bwite n\'Umutekano yagaragara hano.', 'Amabwiriza y\'Ubuzima Bwite n\'Umutekano yagaragara hano.'))}>
            <ShieldCheck className="mr-2 h-5 w-5" />
            <span>{isClient ? t('Ubuzima Bwite & Umutekano', 'Ubuzima Bwite & Umutekano') : 'Ubuzima Bwite & Umutekano'}</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <SidebarTrigger className="md:hidden mr-2" />
            </div>
            <UserNav isAuthenticated={isAuthenticated} /> {/* Pass auth state */}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
