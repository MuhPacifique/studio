
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

interface AppointmentClient { 
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

const t = (enText: string, knText: string) => knText; 

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
  // Assume not authenticated until backend confirms.
  // AppLayout will handle redirection if this page is accessed without auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [appointments, setAppointments] = useState<AppointmentClient[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); 

  useEffect(() => {
    setIsClient(true);
    // Simulate data fetching. No localStorage means data resets on reload.
    // In a real app, data comes from backend.
    setAppointments([ /* Mock data for initial UI structure if needed, but should be empty for this flow
      { id: 'appt1', userId: 'mockUserId123', doctorId: 'doc1', doctorName: 'Dr. Emily Carter', specialty: 'General Physician', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), time: '10:00 AM', status: 'Confirmed', type: 'Online', reason: 'Checkup'},
      { id: 'appt2', userId: 'mockUserId123', doctorId: 'doc2', doctorName: 'Dr. Ben Adams', specialty: 'Pediatrician', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), time: '02:30 PM', status: 'Completed', type: 'In-Person', reason: 'Vaccination'}
    */ ]); 
    setIsLoadingData(false);
  }, []);

  
  const getStatusBadgeVariant = (status: AppointmentClient['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Confirmed': return 'default'; 
      case 'Pending': return 'secondary'; 
      case 'Completed': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: AppointmentClient['status']): string => {
    if (status === 'Confirmed') return t('Byemejwe', 'Byemejwe');
    if (status === 'Pending') return t('Bigitegerejwe', 'Bigitegerejwe');
    if (status === 'Completed') return t('Byarangiye', 'Byarangiye');
    if (status === 'Cancelled') return t('Byahagaritswe', 'Byahagaritswe');
    return status;
  }

  const getTypeText = (type: AppointmentClient['type']): string => {
    if (type === 'Online') return t('Kuri Interineti', 'Kuri Interineti');
    if (type === 'In-Person') return t('Aho Bahurira', 'Aho Bahurira');
    return type;
  }


  const handleCancelAppointment = (apptId: string) => {
    // UI update is ephemeral, backend would handle persistence
    setAppointments(prev => 
        prev.map(appt => appt.id === apptId ? {...appt, status: 'Cancelled'} : appt)
    );
    toast({
        title: t("Gusaba Guhagarika (Igerageza)", "Gusaba Guhagarika (Igerageza)"),
        description: t(`Icyifuzo cyo guhagarika iteraniro ${apptId} cyoherejwe kuri seriveri. Ntibizabikwa muri iyi prototype.`, `Icyifuzo cyo guhagarika iteraniro ${apptId} cyoherejwe kuri seriveri. Ntibizabikwa muri iyi prototype.`),
    });
  };

  const handleJoinCall = (appointment: AppointmentClient) => {
    if (appointment.type === 'Online' && (appointment.status === 'Confirmed' || appointment.status === 'Pending')) { 
        toast({ title: t("Kwinjira mu Bujyanama kuri Interineti (Igerageza)", "Kwinjira mu Bujyanama kuri Interineti (Igerageza)"), description: t(`Guhuza n'ikiganiro cyawe na ${appointment.doctorName}... Ibi byasaba seriveri ya videwo.`, `Guhuza n'ikiganiro cyawe na ${appointment.doctorName}... Ibi byasaba seriveri ya videwo.`)});
        // router.push('/online-consultation'); 
    } else {
        toast({ variant:"destructive", title: t("Ntushobora Kwinjira mu Kiganiro", "Ntushobora Kwinjira mu Kiganiro"), description: t("Iri teraniro ntabwo ari ikiganiro cyo kuri interineti kiri gukora.", "Iri teraniro ntabwo ari ikiganiro cyo kuri interineti kiri gukora.")});
    }
  };


  if (!isClient || isLoadingData) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("Amateraniro Yanjye", "Amateraniro Yanjye")} 
            breadcrumbs={[
            {label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/"}, 
            {label: t("Amateraniro", "Amateraniro"), href: "/appointments/my-appointments"}, 
            {label: t("Amateraniro Yanjye", "Amateraniro Yanjye")}
            ]}
        >
            <Button onClick={() => router.push('/appointments/book')} className="transition-transform hover:scale-105 active:scale-95">
                <CalendarCheck2 className="mr-2 h-4 w-4" /> {t("Fata Igihe Gishya", "Fata Igihe Gishya")}
            </Button>
        </PageHeader>
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Amateraniro Ateganijwe", "Amateraniro Ateganijwe")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppointmentSkeleton />
                    <AppointmentSkeleton />
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Amateraniro Yashize", "Amateraniro Yashize")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppointmentSkeleton />
                </div>
            </section>
        </div>
      </AppLayout>
    );
  }
  
  if (!isAuthenticated) {
     // This case should be handled by AppLayout redirection primarily.
     return (
         <AppLayout>
            <PageHeader title={t("Amateraniro Yanjye", "Amateraniro Yanjye")} />
            <Card className="mt-10 text-center p-10">
                <CardTitle>{t("Ugomba Kwinjira", "Ugomba Kwinjira")}</CardTitle>
                <CardDescription className="mt-2">{t("Nyamuneka injira kugirango urebe amateraniro yawe.", "Nyamuneka injira kugirango urebe amateraniro yawe.")}</CardDescription>
                <Button onClick={() => router.push('/welcome')} className="mt-6">{t("Injira / Iyandikishe", "Injira / Iyandikishe")}</Button>
            </Card>
         </AppLayout>
     )
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
        title={t("Amateraniro Yanjye", "Amateraniro Yanjye")} 
        breadcrumbs={[
          {label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/"}, 
          {label: t("Amateraniro", "Amateraniro"), href: "/appointments/my-appointments"}, 
          {label: t("Amateraniro Yanjye", "Amateraniro Yanjye")}
        ]}
      >
        <Button onClick={() => router.push('/appointments/book')} className="transition-transform hover:scale-105 active:scale-95">
            <CalendarCheck2 className="mr-2 h-4 w-4" /> {t("Fata Igihe Gishya", "Fata Igihe Gishya")}
        </Button>
      </PageHeader>
      
      {appointments.length === 0 && (
        <Card className="text-center p-10 shadow-lg">
            <CalendarCheck2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>{t("Nta Materaniro Ufite", "Nta Materaniro Ufite")}</CardTitle>
            <CardDescription className="mt-2">
                {t("Usa n'aho nta materaniro ufite ateganyijwe cyangwa yashize. Fata igihe gishya ubu! Amakuru y'amateraniro asaba guhuzwa na seriveri.", "Usa n'aho nta materaniro ufite ateganyijwe cyangwa yashize. Fata igihe gishya ubu! Amakuru y'amateraniro asaba guhuzwa na seriveri.")}
            </CardDescription>
        </Card>
      )}

      {upcomingAppointments.length > 0 && (
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Amateraniro Ateganijwe", "Amateraniro Ateganijwe")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingAppointments.map(appt => (
                    <Card key={appt.id} className="shadow-lg hover-lift">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="font-headline text-xl">{appt.doctorName}</CardTitle>
                                <Badge variant={getStatusBadgeVariant(appt.status)}>{getStatusText(appt.status)}</Badge>
                            </div>
                            <CardDescription>{appt.specialty || t('Ubujyanama Rusange', 'Ubujyanama Rusange')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="flex items-center"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} {t('saa', 'saa')} {appt.time}</p>
                            <p className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Ubwoko', 'Ubwoko')}: {getTypeText(appt.type)}</p>
                            {appt.reason && <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Impamvu', 'Impamvu')}: {appt.reason}</p>}
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                           {appt.type === 'Online' && (appt.status === 'Confirmed' || appt.status === 'Pending') && (
                                <Button variant="default" size="sm" onClick={() => handleJoinCall(appt)} className="w-full sm:w-auto">
                                    <Video className="mr-2 h-4 w-4" /> {t("Injira mu Kiganiro", "Injira mu Kiganiro")}
                                </Button>
                            )}
                            {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                 <Button variant="outline" size="sm" onClick={() => toast({title: t("Hindura Igihe (Igerageza)", "Hindura Igihe (Igerageza)"), description: t("Vugana n'ubufasha kugirango uhindure igihe.", "Vugana n'ubufasha kugirango uhindure igihe.")})}  className="w-full sm:w-auto">
                                    <RefreshCw className="mr-2 h-4 w-4" /> {t("Hindura Igihe", "Hindura Igihe")}
                                </Button>
                            )}
                            {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appt.id)} className="w-full sm:w-auto">
                                    <PhoneOff className="mr-2 h-4 w-4" /> {t("Hagarika", "Hagarika")}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
      )}

      {pastAppointments.length > 0 && (
        <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Amateraniro Yashize", "Amateraniro Yashize")}</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastAppointments.map(appt => (
                    <Card key={appt.id} className="shadow-md opacity-80">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="font-headline text-lg">{appt.doctorName}</CardTitle>
                                 <Badge variant={getStatusBadgeVariant(appt.status)}>{getStatusText(appt.status)}</Badge>
                            </div>
                            <CardDescription>{appt.specialty || t('Ubujyanama Rusange', 'Ubujyanama Rusange')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="flex items-center text-sm"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} {t('saa', 'saa')} {appt.time}</p>
                            <p className="flex items-center text-sm"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Ubwoko', 'Ubwoko')}: {getTypeText(appt.type)}</p>
                            {appt.reason && <p className="text-sm flex items-start"><Info className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> {t('Impamvu', 'Impamvu')}: {appt.reason}</p>}
                        </CardContent>
                         {appt.status === 'Completed' && (
                            <CardFooter>
                                <Button variant="ghost" size="sm" onClick={() => toast({title: t("Reba Incamake (Igerageza)", "Reba Incamake (Igerageza)"), description:t("Kwerekana incamake y'iteraniro...", "Kwerekana incamake y'iteraniro...")})}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> {t("Reba Incamake / Inyandiko", "Reba Incamake / Inyandiko")}
                                </Button>
                            </CardFooter>
                         )}
                    </Card>
                ))}
            </div>
        </section>
      )}
    </AppLayout>
  );
}
```