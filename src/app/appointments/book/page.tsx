
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CalendarPlus, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

interface MockDoctorClient { 
  id: string;
  name: string;
  nameKn: string;
  specialty: string;
  specialtyKn: string;
}

const mockDoctorsClient: MockDoctorClient[] = [ 
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

const t = (enText: string, knText: string) => knText; 

export default function BookAppointmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<MockDoctorClient[]>([]);

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching doctors (ephemeral)
    const fetchDoctors = async () => {
        setIsLoadingPage(true);
        // Conceptual: const response = await fetch('/api/doctors/available');
        // Conceptual: const data = await response.json();
        // Conceptual: setDoctors(data.doctors || []);
        await new Promise(resolve => setTimeout(resolve, 100));
        setDoctors(mockDoctorsClient);
        setIsLoadingPage(false);
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
        toast({ variant: "destructive", title: t("Ntabwo Winjiye", "Ntabwo Winjiye"), description: t("Nyamuneka injira kugirango ufashe igihe cyo kwa muganga.", "Nyamuneka injira kugirango ufashe igihe cyo kwa muganga.") });
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
    
    const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);
    if (!selectedDoctor) {
        toast({ variant: "destructive", title: t("Muganga Ntiyabonetse", "Muganga Ntiyabonetse") });
        setIsSubmitting(false);
        return;
    }

    // Simulate API call to backend
    // Conceptual: const response = await fetch('/api/appointments/book', { method: 'POST', body: JSON.stringify({ doctor_id: selectedDoctorId, ...}) });
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    toast({
      title: t("Igihe Cyafashe (Igerageza)", "Igihe Cyafashe (Igerageza)"),
      description: t(`Igihe cyawe na ${selectedDoctor.nameKn} ku itariki ya ${format(selectedDate, "PPP")} saa ${selectedTime} cyasabwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo). Amakuru ntazabikwa muri iyi prototype.`, 
                      `Igihe cyawe na ${selectedDoctor.nameKn} ku itariki ya ${format(selectedDate, "PPP")} saa ${selectedTime} cyasabwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo). Amakuru ntazabikwa muri iyi prototype.`),
    });
    // Reset form - data would be persisted on backend
    setSelectedDate(new Date());
    setSelectedDoctorId(undefined);
    setSelectedTime(undefined);
    setReason("");
    router.push('/appointments/my-appointments'); 
    
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
  
   // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }


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
          {t("Hitamo muganga ukunze, itariki, n'isaha. Nyamuneka tanga impamvu ngufi y'uruzinduko rwawe. Gufata igihe byose bishingiye ku kwemezwa na seriveri. Muri iyi prototype, amakuru ntazabikwa.", 
             "Hitamo muganga ukunze, itariki, n'isaha. Nyamuneka tanga impamvu ngufi y'uruzinduko rwawe. Gufata igihe byose bishingiye ku kwemezwa na seriveri. Muri iyi prototype, amakuru ntazabikwa.")}
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
                    {doctors.map(doc => (
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
