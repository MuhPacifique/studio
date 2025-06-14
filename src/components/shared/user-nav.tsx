
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
import { LogIn, LogOut, UserCircle, UserPlus, LayoutDashboard, Settings, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Role = 'patient' | 'admin' | 'doctor' | 'seeker';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userType, setUserType] = React.useState<Role | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);
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

        if (mockAuth) {
          setIsAuthenticated(true);
          setUserName(storedUserName || (mockAuth === 'admin' ? 'Admin User' : 'Valued User'));
          setProfileImageUrl(storedProfileImage); // Load image from localStorage
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
          event.key === 'mockUserProfileImage' // Listen for profile image changes
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
        'mockUserEmergencyName', 'mockUserEmergencyPhone', 'mockUser2FA'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));

      setIsAuthenticated(false);
      setUserType(null);
      setUserName(null);
      setProfileImageUrl(null);
      
      router.push('/welcome'); 
    }
  };

  return { isAuthenticated, userType, userName, profileImageUrl, logout, isClient };
};

export function UserNav() {
  const { isAuthenticated, userType, userName, profileImageUrl, logout, isClient } = useAuth();
  const [initials, setInitials] = React.useState("U");

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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" asChild>
          <Link href="/welcome">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/welcome">
            <UserPlus className="mr-2 h-4 w-4" /> Register
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary hover:opacity-80 transition-opacity">
            <AvatarImage src={profileImageUrl || undefined} alt={userName || "User"} data-ai-hint="user avatar professional" />
            <AvatarFallback className="text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'User'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          {userType === 'admin' && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
          {userType === 'doctor' && (
            <DropdownMenuItem asChild>
              <Link href="/doctor/dashboard">
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Doctor Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer hover:bg-destructive/10 hover:text-destructive group">
          <LogOut className="mr-2 h-4 w-4 group-hover:text-destructive" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
