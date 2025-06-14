
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
import { LogIn, LogOut, UserCircle, UserPlus, LayoutDashboard, Settings, Briefcase, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Role = 'patient' | 'admin' | 'doctor' | 'seeker';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userType, setUserType] = React.useState<Role | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'kn'>('kn');
  const router = useRouter(); 

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isClient) {
      const updateAuthState = () => {
        const mockAuth = localStorage.getItem('mockAuth');
        const storedUserName = localStorage.getItem('mockUserName');
        const storedRole = localStorage.getItem('selectedRole') as Role | null;
        const storedProfileImage = localStorage.getItem('mockUserProfileImage');
        const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
        if(lang) setPreferredLanguage(lang);

        if (mockAuth) {
          setIsAuthenticated(true);
          setUserName(storedUserName || (mockAuth === 'admin' ? 'Admin User' : 'Valued User'));
          setProfileImageUrl(storedProfileImage); 
          if (mockAuth === 'admin') {
            setUserType('admin');
          } else if (mockAuth === 'doctor') {
            setUserType('doctor');
          } else if (storedRole) {
            setUserType(storedRole);
          } else {
            setUserType('patient'); 
          }
        } else {
          setIsAuthenticated(false);
          setUserType(null);
          setUserName(null);
          setProfileImageUrl(null);
        }
      };

      updateAuthState(); 

      const handleStorageChange = (event: StorageEvent) => {
        if (
          event.key === 'mockAuth' ||
          event.key === 'mockUserName' ||
          event.key === 'selectedRole' ||
          event.key === 'mockUserProfileImage' ||
          event.key === 'mockUserLang' 
        ) {
          updateAuthState();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isClient]); 

  const logout = () => {
    if (isClient) {
      const keysToRemove = [
        'mockAuth', 'mockUserName', 'selectedRole', 'mockUserEmail', 
        'mockUserPhone', 'mockUserProfileImage', 'mockUserDOB', 
        'mockUserAddress', 'mockUserCity', 'mockUserCountry', 'mockUserBio',
        'mockUserLang', 'mockUserMarketing', 'mockUserAppNotifs', 'mockUserTheme',
        'mockUserEmergencyName', 'mockUserEmergencyPhone', 'mockUser2FA', 'theme'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      document.documentElement.classList.remove('dark'); 
      document.documentElement.lang = 'kn'; // Reset lang to Kinyarwanda on logout

      setIsAuthenticated(false);
      setUserType(null);
      setUserName(null);
      setProfileImageUrl(null);
      setPreferredLanguage('kn');
      
      router.push('/welcome'); 
    }
  };

  return { isAuthenticated, userType, userName, profileImageUrl, logout, isClient, preferredLanguage };
};

export function UserNav() {
  const { isAuthenticated, userType, userName, profileImageUrl, logout, isClient, preferredLanguage } = useAuth();
  const [initials, setInitials] = React.useState("U");
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  
  const t = (enText: string, knText: string) => preferredLanguage === 'kn' ? knText : enText;

  useEffect(() => {
    if (isClient) {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        setCurrentTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setCurrentTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setCurrentTheme('light');
      }
    }
  }, [isClient]);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  React.useEffect(() => {
    if (userName) {
      const nameParts = userName.split(' ');
      const firstInitial = nameParts[0]?.[0] || '';
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
      setInitials((firstInitial + lastInitial).toUpperCase() || "U");
    } else {
      setInitials("U");
    }
  }, [userName]);

  if (!isClient) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" className="h-10 w-10 rounded-full animate-pulse bg-muted"></Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={currentTheme === 'dark' ? t("Switch to light mode", "Hindura Uburyo bw'Urumuri") : t("Switch to dark mode", "Hindura Uburyo bw'Umwijima")}
        className="text-foreground hover:bg-accent hover:text-accent-foreground"
      >
        {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      {!isAuthenticated ? (
        <>
          <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="/welcome">
              <LogIn className="mr-2 h-4 w-4" /> {t('Login', 'Injira')}
            </Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/welcome">
              <UserPlus className="mr-2 h-4 w-4" /> {t('Register', 'Iyandikishe')}
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
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userType === 'patient' ? t('Patient', 'Umurwayi') :
                   userType === 'doctor' ? t('Doctor', 'Muganga') :
                   userType === 'admin' ? t('Administrator', 'Umunyamabanga') :
                   userType === 'seeker' ? t('Health Seeker', 'Ushaka Ubujyanama') :
                   t('User', 'Ukoresha')}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>{t('My Profile', 'Umwirondoro Wanjye')}</span>
                </Link>
              </DropdownMenuItem>
              {userType === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{t('Admin Dashboard', 'Imbonerahamwe y\'Ubuyobozi')}</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {userType === 'doctor' && (
                <DropdownMenuItem asChild>
                  <Link href="/doctor/dashboard">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>{t('Doctor Dashboard', 'Imbonerahamwe ya Muganga')}</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive group">
              <LogOut className="mr-2 h-4 w-4 group-hover:text-destructive" />
              <span>{t('Log out', 'Sohoka')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
