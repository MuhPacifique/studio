
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/logo';
import { User, UserCog, Briefcase, Shield, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Role = "patient" | "doctor" | "seeker" | "admin";

const roles: { name: Role; title: string; description: string; icon: React.ElementType; color: string, bgColor: string }[] = [
  { name: "patient", title: "Patient", description: "Access your health records, book appointments, and connect with healthcare providers.", icon: User, color: "text-primary", bgColor: "bg-primary/10 hover:bg-primary/20" },
  { name: "doctor", title: "Doctor", description: "Manage your schedule, consult with patients, and access medical tools.", icon: Briefcase, color: "text-accent", bgColor: "bg-accent/10 hover:bg-accent/20" },
  { name: "seeker", title: "Health Seeker", description: "Explore health resources, find information, and connect with support communities.", icon: UserCog, color: "text-primary", bgColor: "bg-primary/10 hover:bg-primary/20" },
  { name: "admin", title: "Administrator", description: "Manage platform settings, users, and oversee system operations.", icon: Shield, color: "text-destructive", bgColor: "bg-destructive/10 hover:bg-destructive/20 dark:text-destructive-foreground dark:bg-destructive/20" },
];

export default function WelcomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', role); // Store for login/register pages to potentially use
  };

  const getLoginPath = () => {
    if (selectedRole === "admin") return "/admin/login";
    return "/login";
  };
  
  const getRegisterPath = () => {
     // Admin registration is typically not a public flow
    if (selectedRole === "admin") return "#"; // Or disable/hide register for admin
    return "/register";
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page p-4 selection:bg-primary selection:text-primary-foreground">
      <Link href="/" className="mb-8 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
        <LogoIcon className="h-10 w-10" />
        <span className="text-3xl font-bold font-headline">MediServe Hub</span>
      </Link>
      
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-headline gradient-text">Welcome to MediServe Hub!</CardTitle>
          <CardDescription className="text-md sm:text-lg">
            {selectedRole ? `You've selected: ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}. Now, please login or register.` : "Please select your role to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!selectedRole ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {roles.map((role) => (
                <Card 
                  key={role.name} 
                  className={cn("hover-lift cursor-pointer transition-all duration-300 ease-in-out group", role.bgColor)}
                  onClick={() => handleRoleSelect(role.name)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xl font-medium font-headline ${role.color}`}>{role.title}</CardTitle>
                    <role.icon className={`h-8 w-8 ${role.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                     <div className={`flex items-center pt-3 text-sm font-medium ${role.color} group-hover:underline`}>
                        I am a {role.title} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card 
                    className="hover-lift cursor-pointer transition-all duration-300 ease-in-out group bg-primary/10 hover:bg-primary/20"
                    onClick={() => router.push(getLoginPath())}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-medium font-headline text-primary">Login</CardTitle>
                    <LogIn className="h-8 w-8 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Access your existing account.</p>
                     <div className="flex items-center pt-3 text-sm font-medium text-primary group-hover:underline">
                        Proceed to Login <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
                
                {selectedRole !== 'admin' && (
                    <Card 
                        className="hover-lift cursor-pointer transition-all duration-300 ease-in-out group bg-accent/10 hover:bg-accent/20"
                        onClick={() => router.push(getRegisterPath())}
                    >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-medium font-headline text-accent">Register</CardTitle>
                        <UserPlus className="h-8 w-8 text-accent opacity-80 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Create a new account.</p>
                        <div className="flex items-center pt-3 text-sm font-medium text-accent group-hover:underline">
                            Create Account <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                    </CardContent>
                    </Card>
                )}
                 {selectedRole === 'admin' && (
                    <Card 
                        className="opacity-50 cursor-not-allowed bg-muted/10"
                    >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-medium font-headline text-muted-foreground">Register</CardTitle>
                        <UserPlus className="h-8 w-8 text-muted-foreground opacity-80 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Admin registration is managed internally.</p>
                    </CardContent>
                    </Card>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedRole(null)} className="w-full sm:w-auto">
                Back to Role Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
