
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarCheck2, UserCheck, Clock, Info, Video, PhoneOff, RefreshCw, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  specialty?: string; 
  date: string; 
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  type: 'Online' | 'In-Person';
  reason?: string;
}

// Translation helper
const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

const AppointmentSkeleton = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-3/4 mb-1" /> 
        <Skeleton className="h-5 w-20" /> 
      </div>
      <Skeleton className="h-4 w-1/2" /> 
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
      <Skeleton className="h-9 w-full sm:w-28" />
      <Skeleton className="h-9 w-full sm:w-28" />
      <Skeleton className="h-9 w-full sm:w-24" />
    </CardFooter>
  </Card>
);

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); 
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);

  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const userId = localStorage.getItem('mockPatientId') || localStorage.getItem('mockUserEmail');

      setCurrentUserId(userId);

      if (!authStatus || !userId) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe"),
          description: t("Please log in to view your appointments.", "Nyamuneka injira kugirango urebe amateraniro yawe."),
        });
        router.replace('/welcome');
      } else {
        setIsAuthenticated(true);
        loadAppointments(userId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, router, toast, currentLanguage]);

  const loadAppointments = (userId: string) => {
    setIsLoadingData(true);
    try {
      const storedAppointmentsString = localStorage.getItem('userAppointments');
      if (storedAppointmentsString) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointmentsString);
        const userAppointments = allAppointments
            .filter(appt => appt.userId === userId)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); 
        setAppointments(userAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
        console.error("Failed to load appointments:", error);
        toast({variant: "destructive", title: t("Error", "Ikosa"), description: t("Could not load your appointments.", "Ntibishoboye gutegura amateraniro yawe.")})
    } finally {
        setIsLoadingData(false);
    }
  };
  
  const getStatusBadgeVariant = (status: Appointment['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Confirmed': return 'default'; 
      case 'Pending': return 'secondary'; 
      case 'Completed': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: Appointment['status']): string => {
    if (currentLanguage === 'kn') {
      if (status === 'Confirmed') return 'Byemejwe';
      if (status === 'Pending') return 'Bigitegerejwe';
      if (status === 'Completed') return 'Byarangiye';
      if (status === 'Cancelled') return 'Byahagaritswe';
    }
    return status;
  }

  const getTypeText = (type: Appointment['type']): string => {
    if (currentLanguage === 'kn') {
        if (type === 'Online') return 'Kuri Interineti';
        if (type === 'In-Person') return 'Aho Bahurira';
    }
    return type;
  }


  const handleCancelAppointment = (apptId: string) => {
     if (!currentUserId) return;
    setAppointments(prev => 
        prev.map(appt => appt.id === apptId ? {...appt, status: 'Cancelled'} : appt)
    );
    
    const allAppointmentsString = localStorage.getItem('userAppointments');
    let allAppointments: Appointment[] = allAppointmentsString ? JSON.parse(allAppointmentsString) : [];
    const updatedAllAppointments = allAppointments.map(appt => appt.id === apptId && appt.userId === currentUserId ? {...appt, status: 'Cancelled'} : appt);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAllAppointments));
    
    toast({
        title: t("Cancellation Requested", "Guhagarika Byasabwe"),
        description: t(`Request to cancel appointment ${apptId} has been submitted.`, `Gusaba guhagarika iteraniro ${apptId} byoherejwe.`),
    });
  };

  const handleJoinCall = (appointment: Appointment) => {
    if (appointment.type === 'Online' && (appointment.status === 'Confirmed' || appointment.status === 'Pending')) { 
        toast({ title: t("Joining Online Consultation", "Kwinjira mu Bujyanama kuri Interineti"), description: t(`Connecting to your call with ${appointment.doctorName}...`, `Guhuza n'ikiganiro cyawe na ${appointment.doctorName}...`)});
        router.push('/online-consultation'); 
    } else {
        toast({ variant:"destructive", title: t("Cannot Join Call", "Ntushobora Kwinjira mu Kiganiro"), description: t("This appointment is not an active online consultation.", "Iri teraniro ntabwo ari ikiganiro cyo kuri interineti kiri gukora.")});
    }
  };


  if (!isClient || isLoadingData) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("My Appointments", "Amateraniro Yanjye")} 
            breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Appointments", "Amateraniro"), href: "/appointments/my-appointments"}, 
            {label: t("My Appointments", "Amateraniro Yanjye")}
            ]}
        >
            <Button onClick={() => router.push('/appointments/book')} className="transition-transform hover:scale-105 active:scale-95">
                <CalendarCheck2 className="mr-2 h-4 w-4" /> {t("Book New Appointment", "Fata Igihe Gishya")}
            </Button>
        </PageHeader>
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Upcoming Appointments", "Amateraniro Ateganijwe")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppointmentSkeleton />
                    <AppointmentSkeleton />
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Past Appointments", "Amateraniro Yashize")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppointmentSkeleton />
                </div>
            </section>
        </div>
      </AppLayout>
    );
  }

  const upcomingAppointments = appointments
    .filter(appt => (appt.status === 'Confirmed' || appt.status === 'Pending') && !isPast(new Date(appt.date)))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(appt => appt.status === 'Completed' || appt.status === 'Cancelled' || (appt.status !== 'Cancelled' && isPast(new Date(appt.date))))
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <AppLayout>
      <PageHeader 
        title={t("My Appointments", "Amateraniro Yanjye")} 
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("Appointments", "Amateraniro"), href: "/appointments/my-appointments"}, 
          {label: t("My Appointments", "Amateraniro Yanjye")}
        ]}
      >
        <Button onClick={() => router.push('/appointments/book')} className="transition-transform hover:scale-105 active:scale-95">
            <CalendarCheck2 className="mr-2 h-4 w-4" /> {t("Book New Appointment", "Fata Igihe Gishya")}
        </Button>
      </PageHeader>
      
      <div className="space-y-8">
        <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Upcoming Appointments", "Amateraniro Ateganijwe")}</h2>
            {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingAppointments.map(appt => (
                        <Card key={appt.id} className="shadow-lg hover-lift">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline text-xl">{appt.doctorName}</CardTitle>
                                    <Badge variant={getStatusBadgeVariant(appt.status)}>{getStatusText(appt.status)}</Badge>
                                </div>
                                <CardDescription>{appt.specialty || t('General Consultation', 'Ubujyanama Rusange')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="flex items-center"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} {t('at', 'saa')} {appt.time}</p>
                                <p className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Type', 'Ubwoko')}: {getTypeText(appt.type)}</p>
                                {appt.reason && <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Reason', 'Impamvu')}: {appt.reason}</p>}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                               {appt.type === 'Online' && (appt.status === 'Confirmed' || appt.status === 'Pending') && (
                                    <Button variant="default" size="sm" onClick={() => handleJoinCall(appt)} className="w-full sm:w-auto">
                                        <Video className="mr-2 h-4 w-4" /> {t("Join Call", "Injira mu Kiganiro")}
                                    </Button>
                                )}
                                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                     <Button variant="outline" size="sm" onClick={() => toast({title: t("Reschedule (Mock)", "Hindura Igihe (By'agateganyo)"), description: t("Contact support to reschedule.", "Vugana n'ubufasha kugirango uhindure igihe.")})}  className="w-full sm:w-auto">
                                        <RefreshCw className="mr-2 h-4 w-4" /> {t("Reschedule", "Hindura Igihe")}
                                    </Button>
                                )}
                                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                    <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appt.id)} className="w-full sm:w-auto">
                                        <PhoneOff className="mr-2 h-4 w-4" /> {t("Cancel", "Hagarika")}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">{t("You have no upcoming appointments.", "Nta materaniro ateganijwe ufite.")}</p>
            )}
        </section>

        <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Past Appointments", "Amateraniro Yashize")}</h2>
            {pastAppointments.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pastAppointments.map(appt => (
                        <Card key={appt.id} className="shadow-md opacity-80">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline text-lg">{appt.doctorName}</CardTitle>
                                     <Badge variant={getStatusBadgeVariant(appt.status)}>{getStatusText(appt.status)}</Badge>
                                </div>
                                <CardDescription>{appt.specialty || t('General Consultation', 'Ubujyanama Rusange')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="flex items-center text-sm"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} {t('at', 'saa')} {appt.time}</p>
                                <p className="flex items-center text-sm"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Type', 'Ubwoko')}: {getTypeText(appt.type)}</p>
                                {appt.reason && <p className="text-sm flex items-start"><Info className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> {t('Reason', 'Impamvu')}: {appt.reason}</p>}
                            </CardContent>
                             {appt.status === 'Completed' && (
                                <CardFooter>
                                    <Button variant="ghost" size="sm" onClick={() => toast({title: t("View Summary (Mock)", "Reba Incamake (By'agateganyo)"), description:t("Displaying appointment summary...", "Kwerekana incamake y'iteraniro...")})}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> {t("View Summary / Notes", "Reba Incamake / Inyandiko")}
                                    </Button>
                                </CardFooter>
                             )}
                        </Card>
                    ))}
                </div>
            ) : (
                 <p className="text-muted-foreground">{t("You have no past appointments.", "Nta materaniro yashize ufite.")}</p>
            )}
        </section>
      </div>
    </AppLayout>
  );
}
