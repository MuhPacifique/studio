
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

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  specialty?: string; // Make specialty optional if not always available from booking
  date: string; 
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  type: 'Online' | 'In-Person';
  reason?: string;
}

// Translation helper
const t = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
      const userId = localStorage.getItem('mockPatientId') || localStorage.getItem('mockUserEmail');

      if (lang) setCurrentLanguage(lang);
      setCurrentUserId(userId);

      if (!authStatus || !userId) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe", currentLanguage),
          description: t("Please log in to view your appointments.", "Nyamuneka injira kugirango urebe amateraniro yawe.", currentLanguage),
        });
        router.replace('/welcome');
      } else {
        setIsAuthenticated(true);
        loadAppointments(userId);
      }
    }
  }, [isClient, router, toast, currentLanguage]);

  const loadAppointments = (userId: string) => {
    setIsLoading(true);
    try {
      const storedAppointmentsString = localStorage.getItem('userAppointments');
      if (storedAppointmentsString) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointmentsString);
        const userAppointments = allAppointments
            .filter(appt => appt.userId === userId)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
        setAppointments(userAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
        console.error("Failed to load appointments:", error);
        toast({variant: "destructive", title: t("Error", "Ikosa", currentLanguage), description: t("Could not load your appointments.", "Ntibishoboye gutegura amateraniro yawe.", currentLanguage)})
    } finally {
        setIsLoading(false);
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

  const handleCancelAppointment = (apptId: string) => {
    setAppointments(prev => 
        prev.map(appt => appt.id === apptId ? {...appt, status: 'Cancelled'} : appt)
    );
    // Update localStorage
    const updatedAppointments = appointments.map(appt => appt.id === apptId ? {...appt, status: 'Cancelled'} : appt);
    localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments.filter(a => a.userId === currentUserId).concat(appointments.filter(a => a.userId !== currentUserId))));
    
    toast({
        title: t("Cancellation Requested", "Guhagarika Byasabwe", currentLanguage),
        description: t(`Request to cancel appointment ${apptId} has been submitted.`, `Gusaba guhagarika iteraniro ${apptId} byoherejwe.`, currentLanguage),
    });
  };

  const handleJoinCall = (appointment: Appointment) => {
    if (appointment.type === 'Online' && (appointment.status === 'Confirmed' || appointment.status === 'Pending')) { 
        toast({ title: t("Joining Online Consultation", "Kwinjira mu Bujyanama kuri Interineti", currentLanguage), description: t(`Connecting to your call with ${appointment.doctorName}...`, `Guhuza n'ikiganiro cyawe na ${appointment.doctorName}...`, currentLanguage)});
        router.push('/online-consultation'); 
    } else {
        toast({ variant:"destructive", title: t("Cannot Join Call", "Ntushobora Kwinjira mu Kiganiro", currentLanguage), description: t("This appointment is not an active online consultation.", "Iri teraniro ntabwo ari ikiganiro cyo kuri interineti kiri gukora.", currentLanguage)});
    }
  };


  if (!isClient || !isAuthenticated || isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Your Appointments...", "Gutegura Amateraniro Yawe...", currentLanguage)}</p>
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
        title={t("My Appointments", "Amateraniro Yanjye", currentLanguage)} 
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe", currentLanguage), href: "/"}, 
          {label: t("Appointments", "Amateraniro", currentLanguage)}, 
          {label: t("My Appointments", "Amateraniro Yanjye", currentLanguage)}
        ]}
      >
        <Button onClick={() => router.push('/appointments/book')} className="transition-transform hover:scale-105 active:scale-95">
            <CalendarCheck2 className="mr-2 h-4 w-4" /> {t("Book New Appointment", "Fata Igihe Gishya", currentLanguage)}
        </Button>
      </PageHeader>
      
      <div className="space-y-8">
        <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Upcoming Appointments", "Amateraniro Ateganijwe", currentLanguage)}</h2>
            {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingAppointments.map(appt => (
                        <Card key={appt.id} className="shadow-lg hover-lift">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline text-xl">{appt.doctorName}</CardTitle>
                                    <Badge variant={getStatusBadgeVariant(appt.status)}>{t(appt.status, appt.status === 'Pending' ? 'Gitegerejwe' : appt.status === 'Confirmed' ? 'Cyemejwe' : appt.status, currentLanguage )}</Badge>
                                </div>
                                <CardDescription>{appt.specialty || t('General Consultation', 'Ubujyanama Rusange', currentLanguage)}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="flex items-center"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} {t('at', 'saa', currentLanguage)} {appt.time}</p>
                                <p className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Type', 'Ubwoko', currentLanguage)}: {t(appt.type, appt.type === 'Online' ? 'Kuri Interineti' : 'Aho Bahurira', currentLanguage)}</p>
                                {appt.reason && <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Reason', 'Impamvu', currentLanguage)}: {appt.reason}</p>}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                               {appt.type === 'Online' && (appt.status === 'Confirmed' || appt.status === 'Pending') && (
                                    <Button variant="default" size="sm" onClick={() => handleJoinCall(appt)} className="w-full sm:w-auto">
                                        <Video className="mr-2 h-4 w-4" /> {t("Join Call", "Injira mu Kiganiro", currentLanguage)}
                                    </Button>
                                )}
                                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                     <Button variant="outline" size="sm" onClick={() => toast({title: t("Reschedule (Mock)", "Hindura Igihe (By'agateganyo)", currentLanguage), description: t("Contact support to reschedule.", "Vugana n'ubufasha kugirango uhindure igihe.", currentLanguage)})}  className="w-full sm:w-auto">
                                        <RefreshCw className="mr-2 h-4 w-4" /> {t("Reschedule", "Hindura Igihe", currentLanguage)}
                                    </Button>
                                )}
                                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                    <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appt.id)} className="w-full sm:w-auto">
                                        <PhoneOff className="mr-2 h-4 w-4" /> {t("Cancel", "Hagarika", currentLanguage)}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">{t("You have no upcoming appointments.", "Nta materaniro ateganijwe ufite.", currentLanguage)}</p>
            )}
        </section>

        <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">{t("Past Appointments", "Amateraniro Yashize", currentLanguage)}</h2>
            {pastAppointments.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pastAppointments.map(appt => (
                        <Card key={appt.id} className="shadow-md opacity-80">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline text-lg">{appt.doctorName}</CardTitle>
                                     <Badge variant={getStatusBadgeVariant(appt.status)}>{t(appt.status, appt.status === 'Completed' ? 'Byarangiye' : appt.status === 'Cancelled' ? 'Byahagaritswe' : appt.status, currentLanguage )}</Badge>
                                </div>
                                <CardDescription>{appt.specialty || t('General Consultation', 'Ubujyanama Rusange', currentLanguage)}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="flex items-center text-sm"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} {t('at', 'saa', currentLanguage)} {appt.time}</p>
                                <p className="flex items-center text-sm"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> {t('Type', 'Ubwoko', currentLanguage)}: {t(appt.type, appt.type === 'Online' ? 'Kuri Interineti' : 'Aho Bahurira', currentLanguage)}</p>
                                {appt.reason && <p className="text-sm flex items-start"><Info className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> {t('Reason', 'Impamvu', currentLanguage)}: {appt.reason}</p>}
                            </CardContent>
                             {appt.status === 'Completed' && (
                                <CardFooter>
                                    <Button variant="ghost" size="sm" onClick={() => toast({title: t("View Summary (Mock)", "Reba Incamake (By'agateganyo)", currentLanguage), description:t("Displaying appointment summary...", "Kwerekana incamake y'iteraniro...", currentLanguage)})}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> {t("View Summary / Notes", "Reba Incamake / Inyandiko", currentLanguage)}
                                    </Button>
                                </CardFooter>
                             )}
                        </Card>
                    ))}
                </div>
            ) : (
                 <p className="text-muted-foreground">{t("You have no past appointments.", "Nta materaniro yashize ufite.", currentLanguage)}</p>
            )}
        </section>
      </div>
    </AppLayout>
  );
}
