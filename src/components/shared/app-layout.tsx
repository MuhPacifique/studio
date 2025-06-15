
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

  // MOCK AUTHENTICATION STATE - This will always be false now,
  // as persistence via localStorage is removed.
  // Real auth would come from a context/session after backend login.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Simulate initial check

  useEffect(() => {
    setIsClient(true);
    // Simulate checking auth status. Since localStorage is gone,
    // it will always default to not authenticated for this prototype.
    // A real app would make an API call to check session.
    setIsAuthenticated(false); // Explicitly set to false
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    if (isClient && !isLoadingAuth && !isAuthenticated) {
      const allowedPaths = ['/welcome', '/login', '/register', '/admin/login'];
      // Allow root path only if it's the welcome/entry point conceptually.
      // For this setup, if not authenticated, force to /welcome.
      if (!allowedPaths.includes(pathname) && pathname !== '/') {
        console.log(`AppLayout: Unauthenticated. Redirecting from "${pathname}" to /welcome.`);
        router.replace('/welcome');
      } else if (pathname === '/' && !isAuthenticated) {
        // If on root and not authenticated, also redirect to welcome
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
  
  const allowedPathsForUnauthenticated = ['/welcome', '/login', '/register', '/admin/login'];
  if (!isAuthenticated && !allowedPathsForUnauthenticated.includes(pathname) && pathname !== '/' && isClient) {
      return (
           <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('Kuyobora...', 'Kuyobora...')}</p>
          </div>
      );
  }
  // If trying to access root path '/' while unauthenticated, let it go to WelcomePage (handled by its own logic or the effect above)
  // For specific auth-gated pages, the redirection logic above handles it.

  // Render children directly for allowed unauthenticated paths, or if authenticated.
  const shouldRenderFullLayout = isAuthenticated || allowedPathsForUnauthenticated.includes(pathname) || pathname === '/';


  if (!shouldRenderFullLayout && isClient) {
      // This case should ideally be covered by redirects, but as a fallback:
       return (
           <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('Gutegura...', 'Gutegura...')}</p>
          </div>
      );
  }

  // For welcome, login, register pages, we might want a simpler layout (no sidebar/header)
  // Or, if AppLayout is always used, ensure it adapts. For now, it's used globally.
  // The redirection logic should handle unauth access to protected routes.

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
