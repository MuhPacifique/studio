
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

interface MockPatient {
  id: string;
  name: string;
}

interface MockMedicine {
  id: string;
  name: string;
}

interface PrescribedMedicine extends MockMedicine {
  dosage: string;
  frequency: string;
  duration: string;
}

const mockPatients: MockPatient[] = [
  { id: 'p1', name: 'Alice Wonderland' },
  { id: 'p2', name: 'Bob The Builder' },
  { id: 'p3', name: 'Charlie Brown' },
];

const allMockMedicines: MockMedicine[] = [
  { id: 'med1', name: 'Paracetamol 500mg' },
  { id: 'med2', name: 'Amoxicillin 250mg' },
  { id: 'med3', name: 'Loratadine 10mg' },
  { id: 'med4', name: 'Ibuprofen 200mg' },
  { id: 'med5', name: 'Vitamin C 1000mg' },
  { id: 'med6', name: 'Omeprazole 20mg' },
];

export default function PrescribeMedicinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticatedDoctor, setIsAuthenticatedDoctor] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MockMedicine[]>([]);
  const [prescription, setPrescription] = useState<PrescribedMedicine[]>([]);
  const [currentDosage, setCurrentDosage] = useState('');
  const [currentFrequency, setCurrentFrequency] = useState('');
  const [currentDuration, setCurrentDuration] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const storedRole = localStorage.getItem('selectedRole');
      if (authStatus && (storedRole === 'doctor' || authStatus === 'doctor')) {
        setIsAuthenticatedDoctor(true);
      } else {
        toast({ variant: "destructive", title: "Access Denied", description: "Only doctors can access this page." });
        router.replace('/welcome');
      }
    }
  }, [isClient, router, toast]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filtered = allMockMedicines.filter(med =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchTerm]);

  const handleAddMedicineToPrescription = (medicine: MockMedicine) => {
    if (!currentDosage || !currentFrequency || !currentDuration) {
        toast({ variant: "destructive", title: "Missing Details", description: "Please provide dosage, frequency, and duration for the medicine." });
        return;
    }
    setPrescription(prev => [...prev, { ...medicine, dosage: currentDosage, frequency: currentFrequency, duration: currentDuration }]);
    setSearchTerm(''); // Clear search after adding
    setCurrentDosage('');
    setCurrentFrequency('');
    setCurrentDuration('');
    toast({ title: `${medicine.name} added to prescription.` });
  };

  const handleRemoveMedicine = (medicineId: string) => {
    setPrescription(prev => prev.filter(med => med.id !== medicineId));
  };

  const handleSubmitPrescription = async () => {
    if (!selectedPatient || prescription.length === 0) {
      toast({ variant: "destructive", title: "Incomplete Prescription", description: "Please select a patient and add at least one medicine." });
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    setIsLoading(false);
    toast({ title: "Prescription Sent (Mock)", description: `Prescription for ${mockPatients.find(p=>p.id === selectedPatient)?.name} has been recorded.` });
    // Reset form
    setSelectedPatient(undefined);
    setPrescription([]);
    setPatientNotes('');
    router.push('/doctor/dashboard');
  };

  if (!isClient || !isAuthenticatedDoctor) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Prescription Page...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Create Patient Prescription / Advice"
        breadcrumbs={[
          { label: "Dashboard", href: "/"}, 
          { label: "Doctor Portal", href: "/doctor/dashboard"},
          { label: "Prescribe" }
        ]}
      />
      <Card className="w-full max-w-4xl mx-auto shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-6 w-6 text-primary"/>New Prescription</CardTitle>
          <CardDescription>Select patient, add medicines, and provide instructions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="patientSelect" className="mb-1 block">Select Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger id="patientSelect">
                <SelectValue placeholder="Choose a patient..." />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground"/> {patient.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 p-4 border rounded-md bg-muted/30">
            <h3 className="font-semibold text-lg mb-2 text-primary">Add Medicine</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="medicineSearch"
                placeholder="Search for medicine..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto bg-background shadow">
                {searchResults.map(med => (
                  <div key={med.id} className="p-2 hover:bg-muted/50 cursor-pointer text-sm" onClick={() => handleAddMedicineToPrescription(med)}>
                    {med.name}
                  </div>
                ))}
              </div>
            )}
             {searchTerm && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground">No medicines found matching "{searchTerm}".</p>
             )}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                    <Label htmlFor="dosage">Dosage (e.g., 1 tablet, 10ml)</Label>
                    <Input id="dosage" placeholder="e.g., 1 tablet" value={currentDosage} onChange={(e) => setCurrentDosage(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="frequency">Frequency (e.g., Twice a day)</Label>
                    <Input id="frequency" placeholder="e.g., Twice a day" value={currentFrequency} onChange={(e) => setCurrentFrequency(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="duration">Duration (e.g., 7 days)</Label>
                    <Input id="duration" placeholder="e.g., 7 days" value={currentDuration} onChange={(e) => setCurrentDuration(e.target.value)} />
                </div>
             </div>
          </div>
          
          {prescription.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-primary">Current Prescription Items:</h3>
              {prescription.map(med => (
                <Card key={med.id} className="p-4 flex justify-between items-start bg-background shadow-sm">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                        Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
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
            <Label htmlFor="patientNotes">Additional Notes/Advice for Patient</Label>
            <Textarea 
              id="patientNotes"
              placeholder="e.g., Take with food, complete the full course, report any side effects..."
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
            disabled={isLoading || !selectedPatient || prescription.length === 0}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
            {isLoading ? 'Sending...' : 'Send Prescription (Mock)'}
          </Button>
        </CardFooter>
      </Card>
    </AppLayout>
  );
}
