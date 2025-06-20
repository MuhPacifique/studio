
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, Pill, ListOrdered, BarChart3, Settings, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda

const adminFeatures = [
  { title: "Manage Users", titleKn: "Gucunga Abakoresha", description: "View and manage patient and staff accounts.", descriptionKn: "Reba kandi ucunge konti z'abarwayi n'abakozi.", href: "/admin/users", icon: Users, color: "text-primary", bgColor: "bg-primary/5 hover:bg-primary/10", borderColor: "border-primary/20" },
  { title: "Medicine Inventory", titleKn: "Ububiko bw'Imiti", description: "Update and manage medicine stock and details.", descriptionKn: "Hindura kandi ucunge ububiko bw'imiti n'amakuru ajyanye na yo.", href: "/admin/inventory", icon: Pill, color: "text-accent", bgColor: "bg-accent/5 hover:bg-accent/10", borderColor: "border-accent/20" },
  { title: "Service Listings", titleKn: "Urutonde rwa Serivisi", description: "Manage medical tests and consultation services.", descriptionKn: "Gucunga ibipimo bya muganga na serivisi zo kubonana na muganga.", href: "/admin/services", icon: ListOrdered, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-500/5 hover:bg-green-500/10", borderColor: "border-green-500/20" }, 
  { title: "View Analytics", titleKn: "Reba Isesengura", description: "Access reports and statistics on platform usage.", descriptionKn: "Gera kuri raporo n'imibare y'ikoreshwa rya porogaramu.", href: "/admin/analytics", icon: BarChart3, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/5 hover:bg-blue-500/10", borderColor: "border-blue-500/20" }, 
  { title: "System Settings", titleKn: "Igenamiterere rya Sisitemu", description: "Configure application settings and parameters.", descriptionKn: "Hindura igenamiterere n'ibipimo bya porogaramu.", href: "/admin/settings", icon: Settings, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/5 hover:bg-purple-500/10", borderColor: "border-purple-500/20" }, 
];


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); 
  // Mock authentication: In a real app, this comes from context/session
  // For prototype after localStorage removal, assume false unless specific logic sets it.
  // AppLayout's redirection will handle unauthorized access.
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false); 

  useEffect(() => {
    // Simulate checking admin authentication status
    // This page should be protected by AppLayout. If reached, assume "admin" for demo.
    // However, without localStorage, there's no easy way to persist this from admin/login.
    // The conceptual flow is: admin logs in -> gets token -> token used for API calls.
    // For UI, if AppLayout allows access, we proceed. A real check is needed.
    setIsAuthenticatedAdmin(true); // Simulate admin role if page is accessed
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Tugenzura uburenganzira...", "Tugenzura uburenganzira...")}</p>
        </div>
      </AppLayout>
    );
  }

  // This check is largely conceptual now, as AppLayout handles actual redirection.
  if (!isAuthenticatedAdmin) { 
    toast({
        variant: "destructive",
        title: t("Access Denied", "Ntabwo Wemerewe"),
        description: t("You must be an administrator to view this page.", "Ugomba kuba uri umunyamabanga kugirango ubashe kureba iyi paji."),
    });
    router.replace('/admin/login'); // Fallback redirect
    return null; 
  }


  return (
    <AppLayout>
      <PageHeader title={t("Admin Dashboard", "Imbonerahamwe y'Ubuyobozi")} breadcrumbs={[{label: t("Dashboard", "Imbonerahamwe"), href: "/"}, {label: t("Admin", "Ubuyobozi")}]} />
      
      <Card className="mb-8 shadow-lg bg-gradient-to-r from-primary/5 via-card to-accent/5 border-primary/20 hover-lift">
        <CardHeader>
          <CardTitle className="text-2xl font-headline gradient-text">{t("Welcome, Administrator!", "Murakaza neza, Munyamabanga!")}</CardTitle>
          <CardDescription>{t("Manage various aspects of the MediServe Hub platform from here.", "Genzura ibice bitandukanye bya porogaramu ya MediServe Hub uhereye hano.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t("Select a module below to begin managing users, inventory, services, or view system analytics.", "Hitamo kimwe mu bice biri hano hepfo kugirango utangire gucunga abakoresha, ububiko, serivisi, cyangwa kureba isesengura rya sisitemu.")}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Link href={feature.href} key={feature.titleKn} className="block group">
            <Card className={`shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 ${feature.bgColor} border-2 ${feature.borderColor} h-full flex flex-col hover-lift dark:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-lg font-medium font-headline ${feature.color}`}>{t(feature.title, feature.titleKn)}</CardTitle>
                <feature.icon className={`h-7 w-7 ${feature.color} opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110`} />
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{t(feature.description, feature.descriptionKn)}</p>
            </CardContent>
            <CardFooter className="pt-2">
                <div className={`flex items-center text-sm font-medium ${feature.color} group-hover:underline`}>
                    {t('Jya kuri', 'Jya kuri')} {t(feature.title, feature.titleKn)} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
            </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

       <Card className="mt-8 shadow-lg border-destructive/50 bg-destructive/5 dark:bg-destructive/10 hover-lift">
        <CardHeader>
            <CardTitle className="font-headline text-destructive flex items-center"><ShieldAlert className="mr-2 h-5 w-5"/>{t("Admin Responsibilities", "Inshingano z'Umunyamabanga")}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-destructive/80 dark:text-destructive-foreground/80">
                {t("As an administrator, you have access to sensitive data and critical system functions. Please ensure all actions are performed responsibly and in accordance with privacy policies and operational guidelines. Regularly review audit logs and system health.", "Nkumunyamabanga, ufite uburenganzira bwo kugera ku makuru y'ibanga n'imirimo y'ingenzi ya sisitemu. Nyamuneka menya neza ko ibikorwa byose bikorwa mu buryo buboneye kandi hubahirizwa amabwiriza y'ibanga n'ay'imikorere. Genzura buri gihe amateka y'ibikorwa n'ubuzima bwa sisitemu.")}
            </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
```