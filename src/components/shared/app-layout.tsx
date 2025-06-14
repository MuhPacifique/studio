
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

// AppLayout is now language-agnostic for its own text, text comes from children or sub-components
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // MOCK AUTHENTICATION STATE - In a real app, this would come from a context/session
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to not authenticated
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Defaulting to Kinyarwanda as per general direction
  const t = (enText: string, knText: string) => knText;

  useEffect(() => {
    setIsClient(true);
    // Simulate checking auth status (e.g., from a cookie or API call)
    // For this prototype, we'll just use the initial `isAuthenticated` state.
    // To test logged-in state, you'd manually change `isAuthenticated` above to `true`.
    // console.log("AppLayout: Simulating auth check.");
    setIsLoadingAuth(false); // Simulate auth check completion
  }, []);

  useEffect(() => {
    if (isClient && !isLoadingAuth && !isAuthenticated) {
      const allowedPaths = ['/welcome', '/login', '/register', '/admin/login'];
      if (!allowedPaths.includes(pathname)) {
        // console.log(`AppLayout: Unauthenticated user on restricted page "${pathname}". Redirecting to /welcome.`);
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
  
  // If user is not authenticated and trying to access a restricted page,
  // children might not render or might be empty if redirection is in progress.
  // This check ensures we don't render the full layout for non-allowed paths if not authenticated.
  const allowedPaths = ['/welcome', '/login', '/register', '/admin/login'];
  if (!isAuthenticated && !allowedPaths.includes(pathname) && isClient) {
      // Render a minimal loading state or nothing while redirecting
      return (
           <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('Kuyobora...', 'Kuyobora...')}</p> {/* Redirecting... */}
          </div>
      );
  }


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
          {/* Pass isAuthenticated to MainNav if it needs to adjust its items based on auth status */}
          <MainNav isAuthenticated={isAuthenticated} />
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
             {/* Pass isAuthenticated to UserNav if it needs to adjust its display */}
            <UserNav isAuthenticated={isAuthenticated} />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
