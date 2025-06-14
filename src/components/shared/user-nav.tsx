
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
import { LogIn, LogOut, UserCircle, UserPlus, LayoutDashboard, Settings } from 'lucide-react'; // Added Settings for Profile
import { useRouter } from 'next/navigation';


const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'admin' | null>(null); 
  const [userName, setUserName] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // To handle SSR/hydration issues

  useEffect(() => {
    setIsClient(true); // Component has mounted
  }, []);

  useEffect(() => {
    if (isClient) { // Only access localStorage on the client
      const mockAuth = localStorage.getItem('mockAuth');
      if (mockAuth === 'patient') {
        setIsAuthenticated(true);
        setUserType('patient');
        setUserName('Patty Patient'); // Mock name
      } else if (mockAuth === 'admin') {
        setIsAuthenticated(true);
        setUserType('admin');
        setUserName('Admin User'); // Mock name
      } else {
        setIsAuthenticated(false);
        setUserType(null);
        setUserName(null);
      }
    }
  }, [isClient]);


  const login = (type: 'patient' | 'admin', name: string) => {
    if (isClient) {
      localStorage.setItem('mockAuth', type);
      setIsAuthenticated(true);
      setUserType(type);
      setUserName(name);
    }
  };

  const logout = () => {
    if (isClient) {
      localStorage.removeItem('mockAuth');
      setIsAuthenticated(false);
      setUserType(null);
      setUserName(null);
      window.location.href = '/login'; // Redirect to login after logout
    }
  };

  return { isAuthenticated, userType, userName, login, logout, isClient };
};


export function UserNav() {
  const { isAuthenticated, userType, userName, logout, isClient } = useAuth();
  const [initials, setInitials] = useState("U");
  const router = useRouter();

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

  if (!isClient) {
    // Render a placeholder or nothing during SSR and initial client render
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
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/register">
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
            <AvatarImage src={`https://placehold.co/100x100.png`} alt={userName || "User"} data-ai-hint="user avatar" />
            <AvatarFallback className="text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userType === 'admin' ? 'Administrator' : 'Patient'}
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
