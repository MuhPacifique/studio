
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

const mockDoctors = [
  { id: "doc1", name: "Dr. Emily Carter - General Physician", specialty: "General Physician" },
  { id: "doc2", name: "Dr. Ben Adams - Pediatrician", specialty: "Pediatrician" },
  { id: "doc3", name: "Dr. Olivia Chen - Cardiologist", specialty: "Cardiologist" },
];

const availableTimeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          description: "Please log in to book an appointment.",
        });
        router.replace('/welcome');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedDoctor || !selectedTime || !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a date, doctor, time slot, and provide a reason for your visit.",
      });
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Appointment Booked (Mock)",
      description: `Your appointment with ${mockDoctors.find(d=>d.id === selectedDoctor)?.name.split(" - ")[0]} on ${format(selectedDate, "PPP")} at ${selectedTime} has been requested.`,
    });
    setSelectedDate(new Date());
    setSelectedDoctor(undefined);
    setSelectedTime(undefined);
    setReason("");
    setIsSubmitting(false);
     router.push('/appointments/my-appointments');
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Appointment Booker...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Book an Appointment" 
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "Appointments"}, 
          {label: "Book Appointment"}
        ]}
      />
      
      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Booking Information</AlertTitle>
        <AlertDescription>
          Select your preferred doctor, date, and time slot. Please provide a brief reason for your visit.
          All bookings are subject to confirmation.
        </AlertDescription>
      </Alert>

      <Card className="shadow-xl hover-lift">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><CalendarPlus className="mr-2 h-6 w-6 text-primary" /> Appointment Details</CardTitle>
            <CardDescription>Fill in the details below to schedule your consultation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-foreground mb-1">Select Doctor</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger id="doctor" className="w-full">
                    <SelectValue placeholder="Choose a doctor or specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-foreground mb-1">Select Time Slot</label>
                <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate}>
                  <SelectTrigger id="timeSlot" className="w-full">
                    <SelectValue placeholder={selectedDate ? "Choose a time" : "Select a date first"} />
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
               <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border self-center md:self-start shadow-sm"
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Disable past dates
              />
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-1">Reason for Visit</label>
              <Textarea 
                id="reason" 
                placeholder="Briefly describe the reason for your appointment (e.g., regular check-up, specific symptom)..." 
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
                  Requesting Appointment...
                </>
              ) : (
                <>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Request Appointment
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AppLayout>
  );
}
