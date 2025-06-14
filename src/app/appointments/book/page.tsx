
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

interface MockDoctorClient { // Renamed to avoid conflict
  id: string;
  name: string;
  nameKn: string;
  specialty: string;
  specialtyKn: string;
}

interface AppointmentClient { // Renamed
  id: string;
  userId: string; // This would be actual user ID from backend
  doctorId: string;
  doctorName: string;
  date: string; 
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  type: 'Online' | 'In-Person';
}

const mockDoctorsClient: MockDoctorClient[] = [ // Renamed
  { id: "doc1", name: "Dr. Emily Carter", nameKn: "Dr. Emily Carter", specialty: "General Physician", specialtyKn: "Umuganga Rusange" },
  { id: "doc2", name: "Dr. Ben Adams", nameKn: "Dr. Ben Adams", specialty: "Pediatrician", specialtyKn: "Umuganga w'Abana" },
  { id: "doc3", name: "Dr. Olivia Chen", nameKn: "Dr. Olivia Chen", specialty: "Cardiologist", specialtyKn: "Umuganga w'Umutima" },
  { id: "doc4", name: "Dr. Ntwari Jean", nameKn: "Dr. Ntwari Jean", specialty: "General Physician", specialtyKn: "Umuganga Rusange"},
  { id: "doc5", name: "Dr. Keza Alice", nameKn: "Dr. Keza Alice", specialty: "Pediatrician", specialtyKn: "Umuganga w'Abana"},
];

const availableTimeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
];

const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda

export default function BookAppointmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Assume not authenticated until backend confirms
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Simulate auth check
    const checkAuth = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        // This is a placeholder. Real auth would check a session/token.
        setIsAuthenticated(true); // Assume authenticated for prototype
        setIsLoadingPage(false);
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
        toast({ variant: "destructive", title: t("Ntabwo Winjiye", "Ntabwo Winjiye"), description: t("Nyamuneka injira kugirango ufashe igihe cyo kwa muganga.", "Nyamuneka injira kugirango ufashe igihe cyo kwa muganga.") });
        router.push('/welcome');
        return;
    }
    if (!selectedDate || !selectedDoctorId || !selectedTime || !reason.trim()) {
      toast({
        variant: "destructive",
        title: t("Amakuru Arabura", "Amakuru Arabura"),
        description: t("Nyamuneka hitamo itariki, muganga, isaha, kandi utange impamvu y'uruzinduko rwawe.", "Nyamuneka hitamo itariki, muganga, isaha, kandi utange impamvu y'uruzinduko rwawe."),
      });
      return;
    }
    setIsSubmitting(true);
    
    const selectedDoctor = mockDoctorsClient.find(doc => doc.id === selectedDoctorId);
    if (!selectedDoctor) {
        toast({ variant: "destructive", title: t("Muganga Ntiyabonetse", "Muganga Ntiyabonetse") });
        setIsSubmitting(false);
        return;
    }

    // Simulate API call to save appointment
    // const newAppointment: AppointmentClient = { /* ... */ };
    // Backend would handle saving to database based on schema.sql.

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    toast({
      title: t("Igihe Cyafashe (Igerageza)", "Igihe Cyafashe (Igerageza)"),
      description: t(`Igihe cyawe na ${selectedDoctor.nameKn} ku itariki ya ${format(selectedDate, "PPP")} saa ${selectedTime} cyasabwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`, 
                      `Igihe cyawe na ${selectedDoctor.nameKn} ku itariki ya ${format(selectedDate, "PPP")} saa ${selectedTime} cyasabwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`),
    });
    setSelectedDate(new Date());
    setSelectedDoctorId(undefined);
    setSelectedTime(undefined);
    setReason("");
    router.push('/appointments/my-appointments'); // Navigate to view appointments
    
    setIsSubmitting(false);
  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Gutegura Gufata Igihe...", "Gutegura Gufata Igihe...")}</p>
        </div>
      </AppLayout>
    );
  }
  
   if (!isAuthenticated) {
     return (
         <AppLayout>
            <PageHeader title={t("Fata Igihe kwa Muganga", "Fata Igihe kwa Muganga")} />
            <Card className="mt-10 text-center p-10">
                <CardTitle>{t("Ugomba Kwinjira", "Ugomba Kwinjira")}</CardTitle>
                <CardDescription className="mt-2">{t("Nyamuneka injira kugirango ufashe igihe.", "Nyamuneka injira kugirango ufashe igihe.")}</CardDescription>
                <Button onClick={() => router.push('/welcome')} className="mt-6">{t("Injira / Iyandikishe", "Injira / Iyandikishe")}</Button>
            </Card>
         </AppLayout>
     )
  }

  return (
    <AppLayout>
      <PageHeader 
        title={t("Fata Igihe kwa Muganga", "Fata Igihe kwa Muganga")} 
        breadcrumbs={[
          {label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/"}, 
          {label: t("Amateraniro", "Amateraniro"), href: "/appointments/my-appointments"}, 
          {label: t("Fata Igihe", "Fata Igihe")}
        ]}
      />
      
      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">{t("Amakuru yo Gufata Igihe", "Amakuru yo Gufata Igihe")}</AlertTitle>
        <AlertDescription>
          {t("Hitamo muganga ukunze, itariki, n'isaha. Nyamuneka tanga impamvu ngufi y'uruzinduko rwawe. Gufata igihe byose bishingiye ku kwemezwa na seriveri.", 
             "Hitamo muganga ukunze, itariki, n'isaha. Nyamuneka tanga impamvu ngufi y'uruzinduko rwawe. Gufata igihe byose bishingiye ku kwemezwa na seriveri.")}
        </AlertDescription>
      </Alert>

      <Card className="shadow-xl hover-lift">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><CalendarPlus className="mr-2 h-6 w-6 text-primary" /> {t("Amakuru y'Igihe", "Amakuru y'Igihe")}</CardTitle>
            <CardDescription>{t("Uzuza amakuru hano hepfo kugirango ufate igihe cyo kubonana.", "Uzuza amakuru hano hepfo kugirango ufate igihe cyo kubonana.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-foreground mb-1">{t("Hitamo Muganga", "Hitamo Muganga")}</label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger id="doctor" className="w-full">
                    <SelectValue placeholder={t("Hitamo muganga cyangwa ubunararibonye", "Hitamo muganga cyangwa ubunararibonye")} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctorsClient.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.nameKn} ({doc.specialtyKn})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-foreground mb-1">{t("Hitamo Isaha", "Hitamo Isaha")}</label>
                <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate}>
                  <SelectTrigger id="timeSlot" className="w-full">
                    <SelectValue placeholder={selectedDate ? t("Hitamo isaha", "Hitamo isaha") : t("Hitamo itariki mbere", "Hitamo itariki mbere")} />
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
               <label className="block text-sm font-medium text-foreground mb-2">{t("Hitamo Itariki", "Hitamo Itariki")}</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border self-center md:self-start shadow-sm"
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
              />
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-1">{t("Impamvu y'Uruzinduko", "Impamvu y'Uruzinduko")}</label>
              <Textarea 
                id="reason" 
                placeholder={t("Sobanura mu magambo make impamvu y'igihe cyawe (urugero: isuzuma risanzwe, ikimenyetso runaka)...", "Sobanura mu magambo make impamvu y'igihe cyawe (urugero: isuzuma risanzwe, ikimenyetso runaka)...")} 
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
                  {t("Gusaba Igihe...", "Gusaba Igihe...")}
                </>
              ) : (
                <>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  {t("Saba Igihe", "Saba Igihe")}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AppLayout>
  );
}
