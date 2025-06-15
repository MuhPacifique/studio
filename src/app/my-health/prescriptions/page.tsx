
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
import { Skeleton } from '@/components/ui/skeleton';

interface PrescribedMedicineItemClient { 
  id: string;
  name: string;
  nameKn: string;
  dosage: string;
  frequency: string;
  duration: string;
}
interface PrescriptionClient { 
  id: string;
  patientId: string; 
  doctorName: string;
  doctorNameKn: string;
  datePrescribed: string; 
  medicines: PrescribedMedicineItemClient[];
  notes?: string;
  notesKn?: string;
  status: 'Active' | 'Completed' | 'Expired';
}

const t = (enText: string, knText: string) => knText; 

// Mock data - this would be fetched from /api/prescriptions/my in a real app
const mockPrescriptionsData: PrescriptionClient[] = [
    { 
      id: 'rx1', 
      patientId: 'mockUserId123', 
      doctorName: 'Dr. Alex Smith', 
      doctorNameKn: 'Dr. Alex Smith', 
      datePrescribed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      medicines: [
          {id: 'med1', name: 'Paracetamol 500mg', nameKn: 'Parasetamoli 500mg', dosage: '1 tab', frequency: '3 times a day', duration: '5 days'},
          {id: 'med2', name: 'Amoxicillin 250mg', nameKn: 'Amogisiline 250mg', dosage: '1 capsule', frequency: 'every 8 hours', duration: '7 days'}
      ], 
      notes: 'Take Paracetamol only if fever is above 38°C. Complete the full course of Amoxicillin.', 
      notesKn: 'Fata Parasetamoli gusa niba umuriro urenze 38°C. Rangiza imiti yose ya Amogisiline.',
      status: 'Active' 
    },
    { 
      id: 'rx2', 
      patientId: 'mockUserId123', 
      doctorName: 'Dr. Emily Carter', 
      doctorNameKn: 'Dr. Emily Carter', 
      datePrescribed: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      medicines: [
          {id: 'med3', name: 'Loratadine 10mg', nameKn: 'Loratadine 10mg', dosage: '1 tablet', frequency: 'once daily', duration: '14 days'}
      ], 
      notes: 'For seasonal allergies.', 
      notesKn: 'Ku bwivumbure bw\'ibihe.',
      status: 'Completed' 
    }
];


const PrescriptionSkeleton = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Skeleton className="h-5 w-1/4 mb-2" />
        <ul className="space-y-2 pl-2">
          {[1, 2].map(i => (
            <li key={i} className="p-2 border-l-2 border-primary/30 bg-muted/30 dark:bg-muted/10 rounded-r-md">
              <Skeleton className="h-4 w-3/5 mb-1" />
              <Skeleton className="h-3 w-4/5" />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Skeleton className="h-5 w-1/3 mb-1" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
    <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 border-t pt-4">
      <Skeleton className="h-9 w-full sm:w-36" />
      <Skeleton className="h-9 w-full sm:w-40" />
    </CardFooter>
  </Card>
);


export default function MyPrescriptionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [prescriptions, setPrescriptions] = useState<PrescriptionClient[]>([]); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching prescriptions from an API
    const fetchPrescriptions = async () => {
        setIsLoadingData(true);
        // Conceptual: const response = await fetch('/api/prescriptions/my');
        // Conceptual: const data = await response.json();
        // Conceptual: setPrescriptions(data.prescriptions || []);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setPrescriptions(mockPrescriptionsData);
        setIsLoadingData(false);
    };
    fetchPrescriptions();
  }, []);
  
  const getStatusBadgeVariant = (status: PrescriptionClient['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Active': return 'default'; 
      case 'Completed': return 'secondary';
      case 'Expired': return 'outline'; 
      default: return 'outline';
    }
  };
  
  const getStatusText = (status: PrescriptionClient['status']): string => {
    if (status === 'Active') return t('Ikirimo Gukoreshwa', 'Ikirimo Gukoreshwa');
    if (status === 'Completed') return t('Byarangiye', 'Byarangiye');
    if (status === 'Expired') return t('Byarangiye Igihe', 'Byarangiye Igihe');
    return status;
  };

  if (!isClient || isLoadingData) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("My Prescriptions", "Imiti Nandikiwe")} 
            breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("My Health", "Ubuzima Bwanjye"), href: "/my-health/prescriptions"},
            {label: t("My Prescriptions", "Imiti Nandikiwe")}
            ]}
        />
        <div className="space-y-6">
          <PrescriptionSkeleton />
          <PrescriptionSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated && isClient) {
     router.replace('/welcome');
     return null; 
  }
  

  return (
    <AppLayout>
      <PageHeader 
        title={t("My Prescriptions", "Imiti Nandikiwe")} 
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("My Health", "Ubuzima Bwanjye"), href: "/my-health/prescriptions"},
          {label: t("My Prescriptions", "Imiti Nandikiwe")}
        ]}
      />
      
      {prescriptions.length > 0 ? (
        <div className="space-y-6">
          {prescriptions.map(rx => (
            <Card key={rx.id} className="shadow-lg hover-lift">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <CardTitle className="font-headline text-xl mb-1 sm:mb-0">{t("Prescription from", "Urupapuro rw'imiti rwa")} {rx.doctorNameKn}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(rx.status)} className="w-fit">{getStatusText(rx.status)}</Badge>
                </div>
                <CardDescription className="flex items-center text-sm">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> 
                  {t("Prescribed on:", "Rwanditswe ku itariki:")} {format(new Date(rx.datePrescribed), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center"><Pill className="mr-2 h-5 w-5 text-primary"/>{t("Medicines:", "Imiti:")}</h4>
                  <ul className="space-y-2 pl-2">
                    {rx.medicines.map(med => (
                      <li key={med.id} className="text-sm p-2 border-l-2 border-primary/30 bg-muted/30 dark:bg-muted/10 rounded-r-md">
                        <p><span className="font-medium">{med.nameKn}</span></p>
                        <p className="text-xs text-muted-foreground">
                          {t("Dosage:", "Ingano:")} {med.dosage} | {t("Frequency:", "Inshuro:")} {med.frequency} | {t("Duration:", "Igihe:")} {med.duration}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                {rx.notesKn && (
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>{t("Doctor's Notes:", "Inyandiko za Muganga:")}</h4>
                    <p className="text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10 p-3 rounded-md border border-primary/20 whitespace-pre-wrap">{rx.notesKn}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 border-t pt-4">
                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors" onClick={() => toast({description: t("PDF Download (Mock - backend needed)", "Kurura PDF (By'agateganyo - seriveri irakenewe)")})}>
                  <Download className="mr-2 h-4 w-4"/> {t("Download PDF (Mock)", "Kurura PDF (Igerageza)")}
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors" onClick={() => toast({description: t("Print Prescription (Mock - backend needed)", "Chapisha Urupapuro (By'agateganyo - seriveri irakenewe)")})}>
                  <Printer className="mr-2 h-4 w-4"/> {t("Print Prescription (Mock)", "Chapisha Urupapuro (Igerageza)")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-lg hover-lift text-center p-10">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
            <CardTitle className="font-headline">{t("No Prescriptions Found", "Nta Rupapuro rw'Imiti Rubonetse")}</CardTitle>
            <CardContent>
                <p className="text-muted-foreground mt-2">{t("You currently do not have any prescriptions on file. Prescription data is simulated and ephemeral in this prototype.", "Kugeza ubu nta rupapuro rw'imiti rufite mu bubiko. Amakuru y'imiti yandikiwe ni ay'ikitegererezo kandi abikwa by'agateganyo muri iyi prototype.")}</p>
                <Button onClick={() => router.push('/appointments/book')} className="mt-6 transition-transform hover:scale-105 active:scale-95">
                    {t("Book an Appointment", "Fata Igihe kwa Muganga")}
                </Button>
            </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
