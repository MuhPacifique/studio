
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle, Clock, Loader2, FlaskConical, Microscope, HeartPulse, TestTube } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MedicalTest {
  id: string;
  name: string;
  description: string;
  price: number; // Price in RWF
  turnaroundTime: string; 
  preparation?: string; 
  imageUrl: string;
  aiHint: string;
  category: string;
  icon: React.ElementType;
}

const mockMedicalTests: MedicalTest[] = [
  {
    id: 'test1',
    name: 'Complete Blood Count (CBC)',
    description: 'Measures various components of your blood, including red and white blood cells, hemoglobin, and platelets.',
    price: 7500, 
    turnaroundTime: '24 hours',
    preparation: 'No special preparation needed.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'blood test laboratory',
    category: 'Hematology',
    icon: TestTube,
  },
  {
    id: 'test2',
    name: 'Lipid Panel',
    description: 'Measures fats and fatty substances used as a source of energy by your body. Lipids include cholesterol, triglycerides, HDL, and LDL.',
    price: 12000, 
    turnaroundTime: '48 hours',
    preparation: 'Fasting for 9-12 hours is typically required.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'cholesterol screening medical',
    category: 'Cardiology',
    icon: HeartPulse,
  },
  {
    id: 'test3',
    name: 'Thyroid Stimulating Hormone (TSH) Test',
    description: 'Measures the amount of TSH in your blood. TSH is produced by the pituitary gland and helps regulate thyroid function.',
    price: 9000, 
    turnaroundTime: '2-3 days',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'hormone test endocrinology',
    category: 'Endocrinology',
    icon: FlaskConical,
  },
  {
    id: 'test4',
    name: 'Urinalysis',
    description: 'A test of your urine. It\'s used to detect and manage a wide range of disorders, such as urinary tract infections, kidney disease, and diabetes.',
    price: 5000, 
    turnaroundTime: '24 hours',
    preparation: 'Provide a clean-catch urine sample.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'urine sample diagnostics',
    category: 'Pathology',
    icon: Microscope,
  },
];

export default function MedicalTestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
          description: "Please log in to view medical tests.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

  const handleBookTest = (testName: string) => {
    toast({
      title: "Test Booking Initiated (Mock)",
      description: `You have started the booking process for ${testName}. Please follow the next steps.`,
    });
    // In a real app, this would navigate to a booking confirmation page or a payment flow.
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading medical tests...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Available Medical Tests" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Medical Tests"}]}/>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMedicalTests.map((test) => (
          <Card key={test.id} className="flex flex-col shadow-lg hover-lift group dark:border-border">
            <div className="relative overflow-hidden rounded-t-lg">
              <Image
                src={test.imageUrl}
                alt={test.name}
                width={400}
                height={250}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={test.aiHint}
              />
              <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 dark:bg-background/70 backdrop-blur-sm">
                <test.icon className="mr-1.5 h-4 w-4 text-muted-foreground"/> {test.category}
              </Badge>
            </div>
            <CardHeader className="pt-4">
              <CardTitle className="font-headline group-hover:text-primary transition-colors">{test.name}</CardTitle>
              <CardDescription className="text-primary font-semibold text-lg">{test.price.toLocaleString()} RWF</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <p className="text-sm text-muted-foreground">{test.description}</p>
              {test.preparation && (
                <div className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <p><span className="font-medium text-foreground">Preparation:</span> {test.preparation}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 text-accent flex-shrink-0" />
                <p><span className="font-medium text-foreground">Results in:</span> {test.turnaroundTime}</p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <Button 
                  onClick={() => handleBookTest(test.name)}
                  className="w-full transition-transform hover:scale-105 active:scale-95"
                >
                    <ClipboardList className="mr-2 h-4 w-4" /> Book This Test
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
