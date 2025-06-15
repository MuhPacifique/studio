
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, UserCircle, LayoutDashboard, Briefcase, Moon, Sun, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda

export function UserNav({ isAuthenticated: propIsAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated);
  
  const [userName, setUserName] = useState<string | null>(null); 
  const [userRole, setUserRole] = useState<string | null>(null); 
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("U");

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

   useEffect(() => {
    // This effect runs only on the client after mount
    if (typeof window !== "undefined") {
      const isInitiallyDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isInitiallyDark ? 'dark' : 'light');
    }
  }, []); 
  
  useEffect(() => {
    setIsAuthenticated(propIsAuthenticated);
    if (propIsAuthenticated) {
        setUserName(t("Umukoresha Prototipa", "Umukoresha Prototipa")); 
        setUserRole("patient"); 
        setProfileImageUrl(""); 
    } else {
        setUserName(null);
        setUserRole(null);
        setProfileImageUrl(null);
    }
  }, [propIsAuthenticated]);


  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false); 
    setUserName(null);
    setUserRole(null);
    router.push('/welcome');
  };
  
  useEffect(() => {
    if (userName) {
      const nameParts = userName.split(' ');
      const firstInitial = nameParts[0]?.[0] || '';
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
      setInitials((firstInitial + lastInitial).toUpperCase() || "U");
    } else {
      setInitials("U");
    }
  }, [userName]);


  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={currentTheme === 'dark' ? t("Hindura Uburyo bw'Urumuri", "Hindura Uburyo bw'Urumuri") : t("Hindura Uburyo bw'Umwijima", "Hindura Uburyo bw'Umwijima")}
        className="text-foreground hover:bg-accent hover:text-accent-foreground"
      >
        {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      {!isAuthenticated ? (
        <>
          <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="/welcome">
              <LogIn className="mr-2 h-4 w-4" /> {t('Injira', 'Injira')}
            </Link>
          </Button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary hover:opacity-80 transition-opacity">
                <AvatarImage src={profileImageUrl || undefined} alt={userName || "User"} data-ai-hint="user avatar professional"/>
                <AvatarFallback className="text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName || t("Ukoresha", "Ukoresha")}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userRole === 'patient' ? t('Umurwayi', 'Umurwayi') :
                   userRole === 'doctor' ? t('Muganga', 'Muganga') :
                   userRole === 'admin' ? t('Umunyamabanga', 'Umunyamabanga') :
                   userRole === 'seeker' ? t('Ushaka Ubujyanama', 'Ushaka Ubujyanama') :
                   t('Ukoresha', 'Ukoresha')}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>{t('Umwirondoro Wanjye', 'Umwirondoro Wanjye')}</span>
                </Link>
              </DropdownMenuItem>
              {userRole === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{t('Imbonerahamwe y\'Ubuyobozi', 'Imbonerahamwe y\'Ubuyobozi')}</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {userRole === 'doctor' && (
                <DropdownMenuItem asChild>
                  <Link href="/doctor/dashboard">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>{t('Imbonerahamwe ya Muganga', 'Imbonerahamwe ya Muganga')}</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive group">
              <LogOut className="mr-2 h-4 w-4 group-hover:text-destructive" />
              <span>{t('Sohoka', 'Sohoka')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
