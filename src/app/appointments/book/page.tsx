
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CalendarPlus, UserCheck, Clock, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

interface MockDoctor {
  id: string;
  name: string;
  specialty: string;
}

interface Appointment {
  id: string;
  userId: string; // To link appointment to a user
  doctorId: string;
  doctorName: string;
  date: string; // ISO string
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  type: 'Online' | 'In-Person'; // Added for future use
}

const mockDoctors: MockDoctor[] = [
  { id: "doc1", name: "Dr. Emily Carter - General Physician", specialty: "General Physician" },
  { id: "doc2", name: "Dr. Ben Adams - Pediatrician", specialty: "Pediatrician" },
  { id: "doc3", name: "Dr. Olivia Chen - Cardiologist", specialty: "Cardiologist" },
  { id: "doc4", name: "Dr. Ntwari Jean - Umuganga Rusange", specialty: "Umuganga Rusange"},
  { id: "doc5", name: "Dr. Keza Alice - Umuganga w'Abana", specialty: "Umuganga w'Abana"},
];

const availableTimeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
];

// Translation helper
const t = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

export default function BookAppointmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);


  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
      const userId = localStorage.getItem('mockPatientId') || localStorage.getItem('mockUserEmail'); // Use patientId or email as fallback

      if (lang) setCurrentLanguage(lang);
      setCurrentUserId(userId);

      if (!authStatus || !userId) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe", currentLanguage),
          description: t("Please log in to book an appointment.", "Nyamuneka injira kugirango ufashe igihe cyo kwa muganga.", currentLanguage),
        });
        router.replace('/welcome');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast, currentLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedDoctorId || !selectedTime || !reason.trim() || !currentUserId) {
      toast({
        variant: "destructive",
        title: t("Missing Information", "Amakuru Arabura", currentLanguage),
        description: t("Please select a date, doctor, time slot, and provide a reason for your visit.", "Nyamuneka hitamo itariki, muganga, isaha, kandi utange impamvu y'uruzinduko rwawe.", currentLanguage),
      });
      return;
    }
    setIsSubmitting(true);
    
    const selectedDoctor = mockDoctors.find(doc => doc.id === selectedDoctorId);
    if (!selectedDoctor) {
        toast({ variant: "destructive", title: t("Doctor not found", "Muganga Ntiyabonetse", currentLanguage) });
        setIsSubmitting(false);
        return;
    }

    const newAppointment: Appointment = {
        id: `appt_${Date.now()}`,
        userId: currentUserId,
        doctorId: selectedDoctorId,
        doctorName: selectedDoctor.name,
        date: selectedDate.toISOString(),
        time: selectedTime,
        reason: reason,
        status: 'Pending',
        type: 'Online', // Default or allow selection
    };

    try {
        const existingAppointmentsString = localStorage.getItem('userAppointments');
        const existingAppointments: Appointment[] = existingAppointmentsString ? JSON.parse(existingAppointmentsString) : [];
        existingAppointments.push(newAppointment);
        localStorage.setItem('userAppointments', JSON.stringify(existingAppointments));

        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
          title: t("Appointment Booked", "Igihe Cyafashe", currentLanguage),
          description: t(`Your appointment with ${selectedDoctor.name.split(" - ")[0]} on ${format(selectedDate, "PPP")} at ${selectedTime} has been requested.`, 
                          `Igihe cyawe na ${selectedDoctor.name.split(" - ")[0]} ku itariki ya ${format(selectedDate, "PPP")} saa ${selectedTime} cyasabwe.`, currentLanguage),
        });
        setSelectedDate(new Date());
        setSelectedDoctorId(undefined);
        setSelectedTime(undefined);
        setReason("");
        router.push('/appointments/my-appointments');
    } catch (error) {
        console.error("Error saving appointment:", error);
        toast({ variant: "destructive", title: t("Booking Failed", "Gufata Igihe Byanze", currentLanguage), description: t("Could not save your appointment.", "Ntibishoboye kubika igihe cyawe.", currentLanguage)});
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Appointment Booker...", "Gutegura Gufata Igihe...", currentLanguage)}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title={t("Book an Appointment", "Fata Igihe kwa Muganga", currentLanguage)} 
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe", currentLanguage), href: "/"}, 
          {label: t("Appointments", "Amateraniro", currentLanguage)}, 
          {label: t("Book Appointment", "Fata Igihe", currentLanguage)}
        ]}
      />
      
      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">{t("Booking Information", "Amakuru yo Gufata Igihe", currentLanguage)}</AlertTitle>
        <AlertDescription>
          {t("Select your preferred doctor, date, and time slot. Please provide a brief reason for your visit. All bookings are subject to confirmation.", 
             "Hitamo muganga ukunze, itariki, n'isaha. Nyamuneka tanga impamvu ngufi y'uruzinduko rwawe. Gufata igihe byose bishingiye ku kwemezwa.", currentLanguage)}
        </AlertDescription>
      </Alert>

      <Card className="shadow-xl hover-lift">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><CalendarPlus className="mr-2 h-6 w-6 text-primary" /> {t("Appointment Details", "Amakuru y'Igihe", currentLanguage)}</CardTitle>
            <CardDescription>{t("Fill in the details below to schedule your consultation.", "Uzuza amakuru hano hepfo kugirango ufate igihe cyo kubonana.", currentLanguage)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-foreground mb-1">{t("Select Doctor", "Hitamo Muganga", currentLanguage)}</label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger id="doctor" className="w-full">
                    <SelectValue placeholder={t("Choose a doctor or specialty", "Hitamo muganga cyangwa ubunararibonye", currentLanguage)} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-foreground mb-1">{t("Select Time Slot", "Hitamo Isaha", currentLanguage)}</label>
                <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate}>
                  <SelectTrigger id="timeSlot" className="w-full">
                    <SelectValue placeholder={selectedDate ? t("Choose a time", "Hitamo isaha", currentLanguage) : t("Select a date first", "Hitamo itariki mbere", currentLanguage)} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
               <label className="block text-sm font-medium text-foreground mb-2">{t("Select Date", "Hitamo Itariki", currentLanguage)}</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border self-center md:self-start shadow-sm"
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
              />
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-1">{t("Reason for Visit", "Impamvu y'Uruzinduko", currentLanguage)}</label>
              <Textarea 
                id="reason" 
                placeholder={t("Briefly describe the reason for your appointment (e.g., regular check-up, specific symptom)...", "Sobanura mu magambo make impamvu y'igihe cyawe (urugero: isuzuma risanzwe, ikimenyetso runaka)...", currentLanguage)} 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full md:w-auto transition-transform hover:scale-105 active:scale-95" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Requesting Appointment...", "Gusaba Igihe...", currentLanguage)}
                </>
              ) : (
                <>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  {t("Request Appointment", "Saba Igihe", currentLanguage)}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AppLayout>
  );
}
