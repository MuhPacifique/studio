
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
import { format } from 'date-fns';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string; // Store as ISO string or Date object, format for display
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  type: 'Online' | 'In-Person';
  reason?: string;
}

const mockAppointments: Appointment[] = [
  { id: 'appt1', doctorName: 'Dr. Emily Carter', specialty: 'General Physician', date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), time: '10:00 AM', status: 'Confirmed', type: 'Online', reason: 'Follow-up consultation' },
  { id: 'appt2', doctorName: 'Dr. Olivia Chen', specialty: 'Cardiologist', date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), time: '02:30 PM', status: 'Pending', type: 'In-Person', reason: 'Annual check-up' },
  { id: 'appt3', doctorName: 'Dr. Ben Adams', specialty: 'Pediatrician', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), time: '11:00 AM', status: 'Completed', type: 'In-Person', reason: 'Vaccination for child' },
  { id: 'appt4', doctorName: 'Dr. Emily Carter', specialty: 'General Physician', date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), time: '09:00 AM', status: 'Cancelled', type: 'Online', reason: 'Rescheduled' },
];

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in to view your appointments.",
        });
        router.replace('/welcome');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);
  
  const getStatusBadgeVariant = (status: Appointment['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Confirmed': return 'default'; // Primary color
      case 'Pending': return 'secondary'; 
      case 'Completed': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCancelAppointment = (apptId: string) => {
    // Mock cancellation
    toast({
        title: "Cancellation Requested (Mock)",
        description: `Request to cancel appointment ${apptId} has been submitted.`,
    });
    setAppointments(prev => prev.map(appt => appt.id === apptId ? {...appt, status: 'Cancelled'} : appt));
  };

  const handleJoinCall = (appointment: Appointment) => {
    if (appointment.type === 'Online' && (appointment.status === 'Confirmed' || appointment.status === 'Pending')) { // Allow joining for pending too maybe?
        toast({ title: "Joining Online Consultation (Mock)", description: `Connecting to your call with ${appointment.doctorName}...`});
        router.push('/online-consultation'); // Navigate to the consultation page
    } else {
        toast({ variant:"destructive", title: "Cannot Join Call", description: "This appointment is not an active online consultation."});
    }
  };


  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Your Appointments...</p>
        </div>
      </AppLayout>
    );
  }

  const upcomingAppointments = appointments
    .filter(appt => appt.status === 'Confirmed' || appt.status === 'Pending')
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(appt => appt.status === 'Completed' || appt.status === 'Cancelled')
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <AppLayout>
      <PageHeader 
        title="My Appointments" 
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "Appointments"}, 
          {label: "My Appointments"}
        ]}
      >
        <Button onClick={() => router.push('/appointments/book')} className="transition-transform hover:scale-105 active:scale-95">
            <CalendarCheck2 className="mr-2 h-4 w-4" /> Book New Appointment
        </Button>
      </PageHeader>
      
      <div className="space-y-8">
        <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingAppointments.map(appt => (
                        <Card key={appt.id} className="shadow-lg hover-lift">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline text-xl">{appt.doctorName}</CardTitle>
                                    <Badge variant={getStatusBadgeVariant(appt.status)}>{appt.status}</Badge>
                                </div>
                                <CardDescription>{appt.specialty}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="flex items-center"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} at {appt.time}</p>
                                <p className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> Type: {appt.type}</p>
                                {appt.reason && <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" /> Reason: {appt.reason}</p>}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                               {appt.type === 'Online' && (appt.status === 'Confirmed' || appt.status === 'Pending') && (
                                    <Button variant="default" size="sm" onClick={() => handleJoinCall(appt)} className="w-full sm:w-auto">
                                        <Video className="mr-2 h-4 w-4" /> Join Call
                                    </Button>
                                )}
                                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                     <Button variant="outline" size="sm" onClick={() => toast({title: "Reschedule (Mock)", description: "Contact support to reschedule."})}  className="w-full sm:w-auto">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Reschedule
                                    </Button>
                                )}
                                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                                    <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appt.id)} className="w-full sm:w-auto">
                                        <PhoneOff className="mr-2 h-4 w-4" /> Cancel
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">You have no upcoming appointments.</p>
            )}
        </section>

        <section>
            <h2 className="text-2xl font-semibold mb-4 font-headline text-primary">Past Appointments</h2>
            {pastAppointments.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pastAppointments.map(appt => (
                        <Card key={appt.id} className="shadow-md opacity-80">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-headline text-lg">{appt.doctorName}</CardTitle>
                                    <Badge variant={getStatusBadgeVariant(appt.status)}>{appt.status}</Badge>
                                </div>
                                <CardDescription>{appt.specialty}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="flex items-center text-sm"><CalendarCheck2 className="mr-2 h-4 w-4 text-muted-foreground" /> {format(new Date(appt.date), "PPP")} at {appt.time}</p>
                                <p className="flex items-center text-sm"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground" /> Type: {appt.type}</p>
                                {appt.reason && <p className="text-sm flex items-start"><Info className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> Reason: {appt.reason}</p>}
                            </CardContent>
                             {appt.status === 'Completed' && (
                                <CardFooter>
                                    <Button variant="ghost" size="sm" onClick={() => toast({title: "View Summary (Mock)", description:"Displaying appointment summary..."})}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> View Summary / Notes
                                    </Button>
                                </CardFooter>
                             )}
                        </Card>
                    ))}
                </div>
            ) : (
                 <p className="text-muted-foreground">You have no past appointments.</p>
            )}
        </section>
      </div>
    </AppLayout>
  );
}
