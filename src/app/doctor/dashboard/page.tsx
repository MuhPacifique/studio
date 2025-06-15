
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays, Users, MessageSquare, PhoneCall, Settings, BarChart3, FileText, AlertTriangle, ArrowRight, Bell, ClipboardPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Translation helper
const t = (enText: string, knText: string) => knText; 

interface DoctorDashboardMetric {
  title: string;
  titleKn: string;
  value: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  href?: string;
  description?: string;
  descriptionKn?: string;
}

// Data is now static as localStorage is removed. This would come from a backend.
const defaultMetricsData: DoctorDashboardMetric[] = [
  { title: "Today's Appointments", titleKn: "Amateraniro y'Uyu Munsi", value: "5", icon: CalendarDays, bgColor: "bg-primary/10", textColor: "text-primary", href: "#schedule", description: "View your daily schedule", descriptionKn: "Reba gahunda yawe ya buri munsi" },
  { title: "Unread Messages", titleKn: "Ubutumwa Butasomwe", value: "12", icon: MessageSquare, bgColor: "bg-accent/10", textColor: "text-accent", href: "#messages", description: "Check patient communications", descriptionKn: "Genzura itumanaho ry'abarwayi"},
  { title: "Pending Consultations", titleKn: "Ubujyanama Butegerejwe", value: "3", icon: PhoneCall, bgColor: "bg-primary/10", textColor: "text-primary", href: "#consultations", description: "Calls awaiting your attention", descriptionKn: "Telefoni zitegereje ko witaba"},
  { title: "Patient Follow-ups", titleKn: "Gukurikirana Abarwayi", value: "8", icon: Users, bgColor: "bg-accent/10", textColor: "text-accent", href: "#followups", description: "Patients needing follow-up", descriptionKn: "Abarwayi bakeneye gukurikiranwa"},
];

const defaultQuickActionsData = [
    { label: t("View My Schedule", "Reba Gahunda Yanjye"), href: "#schedule", icon: CalendarDays, description: t("Access your appointment calendar.", "Gera kuri kalendari yawe y'amateraniro.") },
    { label: t("Prescribe / Advise Patient", "Kwandika Imiti / Kugira Inama Umurwayi"), href: "/doctor/prescribe", icon: ClipboardPlus, description: t("Create new prescriptions or advice.", "Andika imiti mishya cyangwa inama.") },
    { label: t("Start Next Consultation", "Tangira Ubujyanama Bukurikira"), href: "/online-consultation", icon: PhoneCall, description: t("Begin your scheduled online call.", "Tangira ikiganiro cyawe cyo kuri interineti giteganyijwe.") }, 
    { label: t("Access Patient Records", "Gera kuri Dosiye z'Abarwayi"), href: "#records", icon: FileText, description: t("Securely view patient health information (backend needed).", "Reba amakuru y'ubuzima bw'abarwayi mu buryo bwizewe (seriveri irakenewe).") },
    { label: t("Update Availability", "Hindura Igihe Uboneka"), href: "#availability", icon: Settings, description: t("Manage your consultation hours (backend needed).", "Genzura amasaha yawe yo gutanga ubujyanama (seriveri irakenewe).") },
];

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // AppLayout handles main auth redirection. If user is here, assume they are conceptually "doctor".
  const [isAuthenticatedDoctor, setIsAuthenticatedDoctor] = useState(true); 
  const [doctorName, setDoctorName] = useState(t("Doctor", "Muganga")); // Default name
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // No localStorage to fetch name or role.
    // In a real app, this would come from a user context after login.
    // For now, use defaults or static data.
    setIsLoadingPage(false);
  }, []);


  const handleQuickAction = (href: string, label: string) => {
    if (href.startsWith("/")) {
      router.push(href);
    } else if (href.startsWith("#")) {
       const element = document.getElementById(href.substring(1));
       if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
       }
       toast({ title: t("Navigating (Mock)", "Kujya Kuri (Agateganyo)"), description: t(`Navigating to ${label} section. This requires backend for real data.`, `Kujya ku gice cya ${label}. Ibi bisaba seriveri ku makuru nyayo.`) });
    } else {
      toast({ title: t("Action Triggered (Mock)", "Igikorwa Cyakozwe (Agateganyo)"), description: `${label}` });
    }
  };


  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Doctor Dashboard...", "Gutegura Imbonerahamwe ya Muganga...")}</p>
        </div>
      </AppLayout>
    );
  }
  
  // This check is now mostly conceptual as AppLayout handles redirection.
  if (!isAuthenticatedDoctor) {
    return (
      <AppLayout>
        <PageHeader title={t("Access Denied", "Ntabwo Wemerewe")} />
         <Card className="mt-10 text-center p-10">
            <CardTitle>{t("You must be logged in as a doctor.", "Ugomba kwinjira nka muganga.")}</CardTitle>
            <Button onClick={() => router.push('/welcome')} className="mt-6">{t("Go to Login/Selection", "Jya Kwinjira/Guhitamo")}</Button>
        </Card>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <PageHeader 
        title={`${t('Welcome', 'Murakaza neza')}, ${doctorName}!`} 
        breadcrumbs={[{label: t("Dashboard", "Imbonerahamwe"), href: "/"}, {label: t("Doctor Portal", "Irembo rya Muganga")}]}
      >
        <Button variant="outline" className="transition-transform hover:scale-105 active:scale-95" onClick={() => toast({title: t("Notifications", "Imenyesha"), description: t("You have 3 new notifications. (Mock - Backend needed)", "Ufite amatangazo 3 mashya. (Agateganyo - Seriveri irakenewe)")})}>
            <Bell className="mr-2 h-4 w-4"/> {t("Notifications", "Imenyesha")} <Badge className="ml-2">3</Badge>
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {defaultMetricsData.map(metric => (
          <Card key={metric.titleKn} className={`shadow-lg hover-lift group ${metric.bgColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${metric.textColor}`}>{metric.titleKn}</CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.textColor} opacity-70 group-hover:opacity-100`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</div>
              {metric.href ? (
                <Link href={metric.href} className={`text-xs ${metric.textColor}/80 hover:underline flex items-center group-hover:translate-x-1 transition-transform`}>
                    {metric.descriptionKn || t("View Details", "Reba Ibisobanuro")} <ArrowRight className="ml-1 h-3 w-3"/>
                </Link>
              ) : (
                <p className={`text-xs ${metric.textColor}/80`}>{metric.descriptionKn}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl hover-lift">
            <CardHeader>
                <CardTitle className="font-headline text-primary">{t("Quick Actions", "Ibikorwa Byihuse")}</CardTitle>
                <CardDescription>{t("Access common tasks quickly. Data interactions require backend integration.", "Gera ku mirimo ikunze gukorwa byihuse. Guhinduranya amakuru bisaba guhuzwa na seriveri.")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {defaultQuickActionsData.map(action => (
                    <Button 
                        key={action.label} 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 transition-all hover:bg-primary/5 hover:border-primary group hover-lift"
                        onClick={() => handleQuickAction(action.href, action.label)}
                    >
                        <action.icon className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse"/>
                        <div>
                            <span className="font-medium">{action.label}</span>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                    </Button>
                ))}
            </CardContent>
        </Card>

        <Card className="shadow-xl hover-lift">
            <CardHeader>
                <CardTitle className="font-headline text-accent">{t("System Alerts (Mock)", "Imenyesha rya Sisitemu (Agateganyo)")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-start p-3 bg-destructive/10 border border-destructive/20 rounded-md hover-lift">
                    <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0"/>
                    <div>
                        <p className="font-medium text-destructive">{t("Urgent: Patient Record Update Required", "Byihutirwa: Guhindura Dosiye y'Umurwayi Birakenewe")}</p>
                        <p className="text-xs text-destructive/80">{t("Patient ID: P00123 - Lab results available. (Mock)", "ID y'Umurwayi: P00123 - Ibisubizo bya laboratwari birahari. (Agateganyo)")}</p>
                    </div>
                </div>
                 <div className="flex items-start p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md hover-lift">
                    <Bell className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"/>
                    <div>
                        <p className="font-medium text-yellow-700">{t("Reminder: CME Training Due", "Kwibutsa: Amahugurwa ya CME Arakegereje")}</p>
                        <p className="text-xs text-yellow-600/80">{t("Complete by end of month. (Mock)", "Uzuza bitarenze impera z'ukwezi. (Agateganyo)")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-6">
            <Card id="schedule" className="shadow-lg hover-lift">
                <CardHeader><CardTitle className="font-headline">{t("My Schedule (Mock - Backend Needed)", "Gahunda Yanjye (Agateganyo - Seriveri Irakenewe)")}</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{t("Full calendar view and appointment management will appear here, powered by backend data.", "Kalendari yuzuye n'imicungire y'amateraniro bizagaragara hano, bikoreshejwe amakuru ava kuri seriveri.")}</p></CardContent>
            </Card>
             <Card id="messages" className="shadow-lg hover-lift">
                <CardHeader><CardTitle className="font-headline">{t("Patient Messages (Mock - Backend Needed)", "Ubutumwa bw'Abarwayi (Agateganyo - Seriveri Irakenewe)")}</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{t("Secure messaging interface with patients will appear here, requiring backend for message storage and real-time delivery.", "Uburyo bwizewe bwo kohererezanya ubutumwa n'abarwayi buzagaragara hano, busaba seriveri yo kubika ubutumwa no kubutanga mu gihe nyacyo.")}</p></CardContent>
            </Card>
            {/* Other sections remain similar, emphasizing backend need */}
      </div>
    </AppLayout>
  );
}

