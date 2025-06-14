
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { ShieldCheck } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'kn'>('kn');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) {
      setPreferredLanguage(lang);
    }
  }, []);
  
  const t = (enText: string, knText: string) => preferredLanguage === 'kn' ? knText : enText;


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
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
           <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <ShieldCheck className="mr-2 h-5 w-5" />
            <span>{isClient ? t('Privacy & Security', 'Ubuzima Bwite & Umutekano') : 'Privacy & Security'}</span>
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
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
