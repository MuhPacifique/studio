
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Pill, ListOrdered, BarChart3, Settings, ArrowRight, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const adminFeatures = [
  { title: "Manage Users", description: "View and manage patient and staff accounts.", href: "/admin/users", icon: Users, color: "text-primary", bgColor: "bg-primary/10 hover:bg-primary/20" },
  { title: "Medicine Inventory", description: "Update and manage medicine stock and details.", href: "/admin/inventory", icon: Pill, color: "text-accent", bgColor: "bg-accent/10 hover:bg-accent/20" },
  { title: "Service Listings", description: "Manage available medical tests and consultation services.", href: "/admin/services", icon: ListOrdered, color: "text-purple-500", bgColor: "bg-purple-500/10 hover:bg-purple-500/20" }, // Using a specific purple for variety
  { title: "View Analytics", description: "Access reports and statistics on platform usage.", href: "/admin/analytics", icon: BarChart3, color: "text-orange-500", bgColor: "bg-orange-500/10 hover:bg-orange-500/20" }, // Using a specific orange
  { title: "System Settings", description: "Configure application settings and parameters.", href: "/admin/settings", icon: Settings, color: "text-pink-500", bgColor: "bg-pink-500/10 hover:bg-pink-500/20" }, // Using a specific pink
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
      
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome, Administrator!</CardTitle>
          <CardDescription>Manage various aspects of the MediServe Hub platform from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Select a module below to begin managing users, inventory, services, or view system analytics.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Link href={feature.href} key={feature.title} legacyBehavior>
            <a className="block group">
                <Card className={`shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 ${feature.bgColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-lg font-medium font-headline ${feature.color}`}>{feature.title}</CardTitle>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className={`flex items-center pt-4 text-sm font-medium ${feature.color} group-hover:underline`}>
                        Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </CardContent>
                </Card>
            </a>
          </Link>
        ))}
      </div>

       <Card className="mt-8 shadow-lg border-destructive/50 bg-destructive/5">
        <CardHeader>
            <CardTitle className="font-headline text-destructive flex items-center"><ShieldAlert className="mr-2 h-5 w-5"/>Admin Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-destructive/80">
                As an administrator, you have access to sensitive data and critical system functions. Please ensure all actions are performed responsibly and in accordance with privacy policies and operational guidelines. Regularly review audit logs and system health.
            </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
