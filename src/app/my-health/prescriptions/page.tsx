
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Pill, CalendarDays, Info, Download, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PrescribedMedicineItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}
interface Prescription {
  id: string;
  patientId: string; 
  doctorName: string;
  datePrescribed: string; 
  medicines: PrescribedMedicineItem[];
  notes?: string;
  status: 'Active' | 'Completed' | 'Expired';
}

export default function MyPrescriptionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]); 
  const [isLoadingData, setIsLoadingData] = useState(true);

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
          description: "Please log in to view your prescriptions.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
        // Load prescriptions from localStorage
        const currentPatientId = localStorage.getItem('mockPatientId');
        const allPrescriptionsString = localStorage.getItem('allPrescriptions');
        if (allPrescriptionsString && currentPatientId) {
          try {
            const allPrescriptions: Prescription[] = JSON.parse(allPrescriptionsString);
            const userPrescriptions = allPrescriptions.filter(rx => rx.patientId === currentPatientId);
            setPrescriptions(userPrescriptions.sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime()));
          } catch (error) {
            console.error("Error parsing prescriptions from localStorage:", error);
            toast({variant: "destructive", title: "Error", description: "Could not load your prescriptions."})
          }
        }
        setIsLoadingData(false);
      }
    }
  }, [isClient, router, toast]);
  
  const getStatusBadgeVariant = (status: Prescription['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Active': return 'default'; 
      case 'Completed': return 'secondary';
      case 'Expired': return 'outline'; 
      default: return 'outline';
    }
  };

  if (!isClient || !isAuthenticated || isLoadingData) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Your Prescriptions...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="My Prescriptions" 
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "My Health"}, 
          {label: "My Prescriptions"}
        ]}
      />
      
      {prescriptions.length > 0 ? (
        <div className="space-y-6">
          {prescriptions.map(rx => (
            <Card key={rx.id} className="shadow-lg hover-lift">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <CardTitle className="font-headline text-xl mb-1 sm:mb-0">Prescription from {rx.doctorName}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(rx.status)} className="w-fit">{rx.status}</Badge>
                </div>
                <CardDescription className="flex items-center text-sm">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> 
                  Prescribed on: {format(new Date(rx.datePrescribed), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center"><Pill className="mr-2 h-5 w-5 text-primary"/>Medicines:</h4>
                  <ul className="space-y-2 pl-2">
                    {rx.medicines.map(med => (
                      <li key={med.id} className="text-sm p-2 border-l-2 border-primary/30 bg-muted/30 dark:bg-muted/10 rounded-r-md">
                        <p><span className="font-medium">{med.name}</span></p>
                        <p className="text-xs text-muted-foreground">
                          Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                {rx.notes && (
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>Doctor's Notes:</h4>
                    <p className="text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10 p-3 rounded-md border border-primary/20">{rx.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 border-t pt-4">
                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors">
                  <Download className="mr-2 h-4 w-4"/> Download PDF (Mock)
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors">
                  <Printer className="mr-2 h-4 w-4"/> Print Prescription (Mock)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-lg hover-lift">
            <CardHeader>
                <CardTitle className="font-headline">No Prescriptions Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You currently do not have any prescriptions on record.</p>
                <Button onClick={() => router.push('/appointments/book')} className="mt-4 transition-transform hover:scale-105 active:scale-95">
                    Book an Appointment
                </Button>
            </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}

    