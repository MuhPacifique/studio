
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Pill, PlusCircle, Trash2, Send, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const t = (enText: string, knText: string) => knText; 

interface MockPatientClient { 
  id: string;
  name: string; 
}

interface MockMedicineClient { 
  id: string;
  name: string; 
}

interface PrescribedMedicineItemClient extends MockMedicineClient { 
  dosage: string;
  frequency: string;
  duration: string;
}

// Mock data - will not persist after page reload.
const mockPatientsClient: MockPatientClient[] = [
  { id: 'patient123', name: t('Patty Patient (patient@example.com)', 'Patty Umurwayi (patient@example.com)') },
  { id: 'aliceW', name: t('Alice Wonderland', 'Alice Wonderland') },
  { id: 'bobB', name: t('Bob The Builder', 'Bob Umwubatsi') },
];

const allMockMedicinesClient: MockMedicineClient[] = [
  { id: 'med1', name: t('Paracetamol 500mg', 'Parasetamoli 500mg') },
  { id: 'med2', name: t('Amoxicillin 250mg', 'Amogisiline 250mg') },
  { id: 'med3', name: t('Loratadine 10mg', 'Loratadine 10mg') },
];

export default function PrescribeMedicinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Assume not authenticated until backend confirms.
  // AppLayout will handle redirection if this page is accessed without auth.
  const [isAuthenticatedDoctor, setIsAuthenticatedDoctor] = useState(true); 
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MockMedicineClient[]>([]);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescribedMedicineItemClient[]>([]); // Ephemeral state
  const [currentDosage, setCurrentDosage] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState('');
  const [currentDuration, setCurrentDuration] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // No auth check here, AppLayout handles it.
    setIsLoadingPage(false);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filtered = allMockMedicinesClient.filter(med =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchTerm]);

  const handleAddMedicineToPrescription = () => {
    const selectedMedicine = searchResults.find(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!selectedMedicine) {
        toast({ variant: "destructive", title: t("Nta Muti Wahiswemo", "Nta Muti Wahiswemo"), description: t("Nyamuneka hitamo umuti mu bisubizo by'ubushakashatsi cyangwa urebe ko ijambo washakishije rihura n'umuti uboneka.", "Nyamuneka hitamo umuti mu bisubizo by'ubushakashatsi cyangwa urebe ko ijambo washakishije rihura n'umuti uboneka.") });
        return;
    }
    if (!currentDosage || !currentFrequency || !currentDuration) {
        toast({ variant: "destructive", title: t("Amakuru Arabura", "Amakuru Arabura"), description: t("Nyamuneka tanga ingano, inshuro, n'igihe cyo gufata umuti.", "Nyamuneka tanga ingano, inshuro, n'igihe cyo gufata umuti.") });
        return;
    }
    // UI update is ephemeral
    setPrescriptionItems(prev => [...prev, { ...selectedMedicine, dosage: currentDosage, frequency: currentFrequency, duration: currentDuration }]);
    setSearchTerm(''); 
    setCurrentDosage('');
    setCurrentFrequency('');
    setCurrentDuration('');
    toast({ title: t(`${selectedMedicine.name} wongewe ku rupapuro. (Ntibizabikwa)`, `${selectedMedicine.name} wongewe ku rupapuro. (Ntibizabikwa)`) });
  };
  
  const handleSelectMedicineFromSearch = (medicine: MockMedicineClient) => {
    setSearchTerm(medicine.name);
    setSearchResults([]); 
  };


  const handleRemoveMedicine = (medicineId: string) => {
    // UI update is ephemeral
    setPrescriptionItems(prev => prev.filter(med => med.id !== medicineId));
  };

  const handleSubmitPrescription = async () => {
    if (!selectedPatient || prescriptionItems.length === 0) {
      toast({ variant: "destructive", title: t("Urupapuro Rutuzuye", "Urupapuro Rutuzuye"), description: t("Nyamuneka hitamo umurwayi kandi wongereho nibura umuti umwe.", "Nyamuneka hitamo umurwayi kandi wongereho nibura umuti umwe.") });
      return;
    }
    setIsSubmitting(true);

    // Simulate API call. No data is persisted.
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setIsSubmitting(false);
    toast({ title: t("Urupapuro rw'Imiti Rwabitswe (Igerageza)", "Urupapuro rw'Imiti Rwabitswe (Igerageza)"), description: t(`Urupapuro rw'imiti rwa ${mockPatientsClient.find(p=>p.id === selectedPatient)?.name} rwoherejwe kuri seriveri (mu buryo bw'ikitegererezo). Amakuru ntazabikwa muri iyi prototype.`, `Urupapuro rw'imiti rwa ${mockPatientsClient.find(p=>p.id === selectedPatient)?.name} rwoherejwe kuri seriveri (mu buryo bw'ikitegererezo). Amakuru ntazabikwa muri iyi prototype.`) });
    
    setSelectedPatient(undefined);
    setPrescriptionItems([]);
    setPatientNotes('');
    setSearchTerm('');
    setCurrentDosage('');
    setCurrentFrequency('');
    setCurrentDuration('');
    router.push('/doctor/dashboard');

  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Andika Imiti / Inama ku Murwayi", "Andika Imiti / Inama ku Murwayi")} />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Gutegura Urupapuro rw'Imiti...", "Gutegura Urupapuro rw'Imiti...")}</p>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticatedDoctor) {
     // This case should be handled by AppLayout redirection primarily.
     return (
         <AppLayout>
            <PageHeader title={t("Andika Imiti / Inama ku Murwayi", "Andika Imiti / Inama ku Murwayi")} />
            <Card className="mt-10 text-center p-10">
                <CardTitle>{t("Ugomba Kwinjira nka Muganga", "Ugomba Kwinjira nka Muganga")}</CardTitle>
                <CardDescription className="mt-2">{t("Muganga wenyine ni we ushobora kugera kuri iyi paji.", "Muganga wenyine ni we ushobora kugera kuri iyi paji.")}</CardDescription>
                <Button onClick={() => router.push('/welcome')} className="mt-6">{t("Injira / Iyandikishe", "Injira / Iyandikishe")}</Button>
            </Card>
         </AppLayout>
     )
  }


  return (
    <AppLayout>
      <PageHeader 
        title={t("Andika Imiti / Inama ku Murwayi", "Andika Imiti / Inama ku Murwayi")}
        breadcrumbs={[
          { label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/"}, 
          { label: t("Irembo rya Muganga", "Irembo rya Muganga"), href: "/doctor/dashboard"},
          { label: t("Kwandika Imiti", "Kwandika Imiti") }
        ]}
      />
      <Card className="w-full max-w-4xl mx-auto shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-6 w-6 text-primary"/>{t("Urupapuro Rushya rw'Imiti", "Urupapuro Rushya rw'Imiti")}</CardTitle>
          <CardDescription>{t("Hitamo umurwayi, ongeraho imiti, kandi utange amabwiriza. Amakuru ntazabikwa muri iyi prototype.", "Hitamo umurwayi, ongeraho imiti, kandi utange amabwiriza. Amakuru ntazabikwa muri iyi prototype.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="patientSelect" className="mb-1 block">{t("Hitamo Umurwayi", "Hitamo Umurwayi")}</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger id="patientSelect">
                <SelectValue placeholder={t("Hitamo umurwayi...", "Hitamo umurwayi...")} />
              </SelectTrigger>
              <SelectContent>
                {mockPatientsClient.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground"/> {patient.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 p-4 border rounded-md bg-muted/30 dark:bg-muted/10">
            <h3 className="font-semibold text-lg mb-2 text-primary">{t("Ongeraho Umuti", "Ongeraho Umuti")}</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="medicineSearch"
                placeholder={t("Shakisha umuti...", "Shakisha umuti...")} 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto bg-background shadow">
                {searchResults.map(med => (
                  <div key={med.id} className="p-2 hover:bg-muted/50 cursor-pointer text-sm" onClick={() => handleSelectMedicineFromSearch(med)}>
                    {med.name}
                  </div>
                ))}
              </div>
            )}
             {searchTerm && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("Nta miti ibonetse ihuye na", "Nta miti ibonetse ihuye na")} "{searchTerm}".</p>
             )}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                    <Label htmlFor="dosage">{t("Ingano (urugero: ikinini 1, 10ml)", "Ingano (urugero: ikinini 1, 10ml)")}</Label>
                    <Input id="dosage" placeholder={t("urugero: ikinini 1", "urugero: ikinini 1")} value={currentDosage} onChange={(e) => setCurrentDosage(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="frequency">{t("Inshuro (urugero: Kabiri ku munsi)", "Inshuro (urugero: Kabiri ku munsi)")}</Label>
                    <Input id="frequency" placeholder={t("urugero: Kabiri ku munsi", "urugero: Kabiri ku munsi")} value={currentFrequency} onChange={(e) => setCurrentFrequency(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="duration">{t("Igihe (urugero: Iminsi 7)", "Igihe (urugero: Iminsi 7)")}</Label>
                    <Input id="duration" placeholder={t("urugero: Iminsi 7", "urugero: Iminsi 7")} value={currentDuration} onChange={(e) => setCurrentDuration(e.target.value)} />
                </div>
             </div>
             <Button type="button" onClick={handleAddMedicineToPrescription} className="mt-2" disabled={!searchTerm || !currentDosage || !currentFrequency || !currentDuration}>
                <PlusCircle className="mr-2 h-4 w-4"/> {t("Ongeraho ku Rupapuro", "Ongeraho ku Rupapuro")}
             </Button>
          </div>
          
          {prescriptionItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-primary">{t("Imiti Iri ku Rupapuro Ubu:", "Imiti Iri ku Rupapuro Ubu:")}</h3>
              {prescriptionItems.map(med => (
                <Card key={med.id} className="p-4 flex justify-between items-start bg-background shadow-sm">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {t("Ingano:", "Ingano:")} {med.dosage} | {t("Inshuro:", "Inshuro:")} {med.frequency} | {t("Igihe:", "Igihe:")} {med.duration}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveMedicine(med.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="patientNotes">{t("Inyandiko / Inama Zinyongera ku Murwayi", "Inyandiko / Inama Zinyongera ku Murwayi")}</Label>
            <Textarea 
              id="patientNotes"
              placeholder={t("urugero: Fata nyuma yo kurya, rangiza imiti yose, tanga raporo ku ngaruka mbi zose...", "urugero: Fata nyuma yo kurya, rangiza imiti yose, tanga raporo ku ngaruka mbi zose...")}
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full sm:w-auto ml-auto transition-transform hover:scale-105 active:scale-95" 
            onClick={handleSubmitPrescription}
            disabled={isSubmitting || !selectedPatient || prescriptionItems.length === 0}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
            {isSubmitting ? t('Kohereza...', 'Kohereza...') : t('Bika & Ohereza Urupapuro', 'Bika & Ohereza Urupapuro')}
          </Button>
        </CardFooter>
      </Card>
    </AppLayout>
  );
}
```