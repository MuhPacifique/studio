
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

// Translation helper
const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]); 
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);
  
  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe"),
          description: t("Please log in to view your prescriptions.", "Nyamuneka injira kugirango ubashe kureba imiti wandikiwe."),
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
        const currentPatientId = localStorage.getItem('mockPatientId');
        const allPrescriptionsString = localStorage.getItem('allPrescriptions');
        if (allPrescriptionsString && currentPatientId) {
          try {
            const allPrescriptions: Prescription[] = JSON.parse(allPrescriptionsString);
            const userPrescriptions = allPrescriptions.filter(rx => rx.patientId === currentPatientId);
            setPrescriptions(userPrescriptions.sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime()));
          } catch (error) {
            console.error("Error parsing prescriptions from localStorage:", error);
            toast({variant: "destructive", title: t("Error", "Ikosa"), description: t("Could not load your prescriptions.", "Ntibishoboye gutegura imiti wandikiwe.")})
          }
        }
        setIsLoadingData(false);
      }
    }
  }, [isClient, router, toast, currentLanguage]);
  
  const getStatusBadgeVariant = (status: Prescription['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Active': return 'default'; 
      case 'Completed': return 'secondary';
      case 'Expired': return 'outline'; 
      default: return 'outline';
    }
  };
  
  const getStatusText = (status: Prescription['status']): string => {
    if (currentLanguage === 'kn') {
      if (status === 'Active') return 'Ikirimo Gukoreshwa';
      if (status === 'Completed') return 'Byarangiye';
      if (status === 'Expired') return 'Byarangiye Igihe';
    }
    return status;
  };

  if (!isClient || isLoadingData) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("My Prescriptions", "Imiti Nandikiwe")} 
            breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("My Health", "Ubuzima Bwanjye"), href: "/my-health/prescriptions"}, // Assuming #my-health resolves to this or similar parent
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
                  <CardTitle className="font-headline text-xl mb-1 sm:mb-0">{t("Prescription from", "Urupapuro rw'imiti rwa")} {rx.doctorName}</CardTitle>
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
                        <p><span className="font-medium">{med.name}</span></p>
                        <p className="text-xs text-muted-foreground">
                          {t("Dosage:", "Ingano:")} {med.dosage} | {t("Frequency:", "Inshuro:")} {med.frequency} | {t("Duration:", "Igihe:")} {med.duration}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                {rx.notes && (
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>{t("Doctor's Notes:", "Inyandiko za Muganga:")}</h4>
                    <p className="text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10 p-3 rounded-md border border-primary/20">{rx.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 border-t pt-4">
                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors">
                  <Download className="mr-2 h-4 w-4"/> {t("Download PDF (Mock)", "Kurura PDF (By'agateganyo)")}
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:border-primary transition-colors">
                  <Printer className="mr-2 h-4 w-4"/> {t("Print Prescription (Mock)", "Chapisha Urupapuro (By'agateganyo)")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-lg hover-lift">
            <CardHeader>
                <CardTitle className="font-headline">{t("No Prescriptions Found", "Nta Rupapuro rw'Imiti Rubonetse")}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t("You currently do not have any prescriptions on record.", "Kugeza ubu nta rupapuro rw'imiti rufite mu bubiko.")}</p>
                <Button onClick={() => router.push('/appointments/book')} className="mt-4 transition-transform hover:scale-105 active:scale-95">
                    {t("Book an Appointment", "Fata Igihe kwa Muganga")}
                </Button>
            </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
