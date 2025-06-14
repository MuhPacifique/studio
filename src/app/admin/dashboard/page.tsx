
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Pill, ListOrdered, BarChart3, Settings, ArrowRight, ShieldAlert, Server, DatabaseZap, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const adminFeatures = [
  { title: "Manage Users", description: "View and manage patient and staff accounts.", href: "/admin/users", icon: Users, color: "text-primary", bgColor: "bg-primary/10 hover:bg-primary/20", borderColor: "border-primary/30" },
  { title: "Medicine Inventory", description: "Update and manage medicine stock and details.", href: "/admin/inventory", icon: Pill, color: "text-accent", bgColor: "bg-accent/10 hover:bg-accent/20", borderColor: "border-accent/30" },
  { title: "Service Listings", description: "Manage medical tests and consultation services.", href: "/admin/services", icon: ListOrdered, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-500/10 hover:bg-green-500/20", borderColor: "border-green-500/30" }, 
  { title: "View Analytics", description: "Access reports and statistics on platform usage.", href: "/admin/analytics", icon: BarChart3, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10 hover:bg-blue-500/20", borderColor: "border-blue-500/30" }, 
  { title: "System Settings", description: "Configure application settings and parameters.", href: "/admin/settings", icon: Settings, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/10 hover:bg-purple-500/20", borderColor: "border-purple-500/30" }, 
];


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = localStorage.getItem('mockAuth');
    if (authStatus !== 'admin') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be an administrator to view this page.",
      });
      router.replace('/admin/login');
    }
  }, [router, toast]);


  return (
    <AppLayout>
      <PageHeader title="Admin Dashboard" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Admin"}]} />
      
      <Card className="mb-8 shadow-lg bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-headline gradient-text">Welcome, Administrator!</CardTitle>
          <CardDescription>Manage various aspects of the MediServe Hub platform from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Select a module below to begin managing users, inventory, services, or view system analytics.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Link href={feature.href} key={feature.title} className="block group">
            <Card className={`shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 ${feature.bgColor} border ${feature.borderColor} h-full flex flex-col hover-lift`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-lg font-medium font-headline ${feature.color}`}>{feature.title}</CardTitle>
                <feature.icon className={`h-7 w-7 ${feature.color} opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-3`} />
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardFooter className="pt-2">
                <div className={`flex items-center text-sm font-medium ${feature.color} group-hover:underline`}>
                    Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
            </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

       <Card className="mt-8 shadow-lg border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
        <CardHeader>
            <CardTitle className="font-headline text-destructive flex items-center"><ShieldAlert className="mr-2 h-5 w-5"/>Admin Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-destructive/80 dark:text-destructive-foreground/80">
                As an administrator, you have access to sensitive data and critical system functions. Please ensure all actions are performed responsibly and in accordance with privacy policies and operational guidelines. Regularly review audit logs and system health.
            </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
