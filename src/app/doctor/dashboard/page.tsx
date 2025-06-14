
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays, Users, MessageSquare, PhoneCall, Settings, BarChart3, FileText, AlertTriangle, ArrowRight, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface DoctorDashboardMetric {
  title: string;
  value: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  href?: string;
  description?: string;
}

const mockMetrics: DoctorDashboardMetric[] = [
  { title: "Today's Appointments", value: "5", icon: CalendarDays, bgColor: "bg-primary/10", textColor: "text-primary", href: "#schedule", description: "View your daily schedule" },
  { title: "Unread Messages", value: "12", icon: MessageSquare, bgColor: "bg-accent/10", textColor: "text-accent", href: "#messages", description: "Check patient communications"},
  { title: "Pending Consultations", value: "3", icon: PhoneCall, bgColor: "bg-primary/10", textColor: "text-primary", href: "#consultations", description: "Calls awaiting your attention"},
  { title: "Patient Follow-ups", value: "8", icon: Users, bgColor: "bg-accent/10", textColor: "text-accent", href: "#followups", description: "Patients needing follow-up"},
];

const quickActions = [
    { label: "View My Schedule", href: "#schedule", icon: CalendarDays },
    { label: "Start Next Consultation", href: "/online-consultation", icon: PhoneCall }, // Link to actual consultation page
    { label: "Access Patient Records", href: "#records", icon: FileText },
    { label: "Update Availability", href: "#availability", icon: Settings },
];

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticatedDoctor, setIsAuthenticatedDoctor] = useState(false);
  const [doctorName, setDoctorName] = useState("Doctor");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const storedRole = localStorage.getItem('selectedRole');
      const storedUserName = localStorage.getItem('mockUserName');

      if (authStatus && storedRole === 'doctor') {
        setIsAuthenticatedDoctor(true);
        setDoctorName(storedUserName || "Doctor");
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be logged in as a doctor to view this page.",
        });
        router.replace('/welcome');
      }
    }
  }, [isClient, router, toast]);

  if (!isClient || !isAuthenticatedDoctor) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Doctor Dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title={`Welcome, ${doctorName}!`} 
        breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Doctor Dashboard"}]}
      >
        <Button variant="outline" className="transition-transform hover:scale-105 active:scale-95">
            <Bell className="mr-2 h-4 w-4"/> Notifications <Badge className="ml-2">3</Badge>
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {mockMetrics.map(metric => (
          <Card key={metric.title} className={`shadow-lg hover-lift group ${metric.bgColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${metric.textColor}`}>{metric.title}</CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.textColor} opacity-70 group-hover:opacity-100`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</div>
              {metric.href ? (
                <Link href={metric.href} className={`text-xs ${metric.textColor}/80 hover:underline flex items-center group-hover:translate-x-1 transition-transform`}>
                    {metric.description || "View Details"} <ArrowRight className="ml-1 h-3 w-3"/>
                </Link>
              ) : (
                <p className={`text-xs ${metric.textColor}/80`}>{metric.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl hover-lift">
            <CardHeader>
                <CardTitle className="font-headline text-primary">Quick Actions</CardTitle>
                <CardDescription>Access common tasks quickly.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map(action => (
                    <Button 
                        key={action.label} 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 transition-all hover:bg-primary/5 hover:border-primary group"
                        onClick={() => action.href.startsWith("/") ? router.push(action.href) : toast({title: "Navigating (Mock)", description: `To ${action.label}`})}
                    >
                        <action.icon className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse"/>
                        <div>
                            <span className="font-medium">{action.label}</span>
                            <p className="text-xs text-muted-foreground">Shortcut to {action.label.toLowerCase()}</p>
                        </div>
                    </Button>
                ))}
            </CardContent>
        </Card>

        <Card className="shadow-xl hover-lift">
            <CardHeader>
                <CardTitle className="font-headline text-accent">System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-start p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0"/>
                    <div>
                        <p className="font-medium text-destructive">Urgent: Patient Record Update Required</p>
                        <p className="text-xs text-destructive/80">Patient ID: P00123 - Lab results available.</p>
                    </div>
                </div>
                 <div className="flex items-start p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <Bell className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"/>
                    <div>
                        <p className="font-medium text-yellow-700">Reminder: CME Training Due</p>
                        <p className="text-xs text-yellow-600/80">Complete by end of month.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Placeholder sections for other features */}
      <div className="mt-8 space-y-6">
            <Card id="schedule" className="shadow-lg">
                <CardHeader><CardTitle className="font-headline">My Schedule (Mock)</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Full calendar view and appointment management will appear here.</p></CardContent>
            </Card>
             <Card id="messages" className="shadow-lg">
                <CardHeader><CardTitle className="font-headline">Patient Messages (Mock)</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Secure messaging interface with patients will appear here.</p></CardContent>
            </Card>
            <Card id="consultations" className="shadow-lg">
                <CardHeader><CardTitle className="font-headline">Consultation History & Notes (Mock)</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Records of past consultations and notes will appear here.</p></CardContent>
            </Card>
      </div>


    </AppLayout>
  );
}
