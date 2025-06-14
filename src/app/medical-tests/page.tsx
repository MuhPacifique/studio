
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface MedicalTest {
  id: string;
  name: string;
  description: string;
  price: number;
  turnaroundTime: string; 
  preparation?: string; 
  imageUrl: string;
  aiHint: string;
}

const mockMedicalTests: MedicalTest[] = [
  {
    id: 'test1',
    name: 'Complete Blood Count (CBC)',
    description: 'Measures various components of your blood, including red and white blood cells, hemoglobin, and platelets.',
    price: 75.00,
    turnaroundTime: '24 hours',
    preparation: 'No special preparation needed.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'blood test laboratory',
  },
  {
    id: 'test2',
    name: 'Lipid Panel',
    description: 'Measures fats and fatty substances used as a source of energy by your body. Lipids include cholesterol, triglycerides, HDL, and LDL.',
    price: 120.00,
    turnaroundTime: '48 hours',
    preparation: 'Fasting for 9-12 hours is typically required.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'cholesterol screening medical',
  },
  {
    id: 'test3',
    name: 'Thyroid Stimulating Hormone (TSH) Test',
    description: 'Measures the amount of TSH in your blood. TSH is produced by the pituitary gland and helps regulate thyroid function.',
    price: 90.00,
    turnaroundTime: '2-3 days',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'hormone test endocrinology',
  },
  {
    id: 'test4',
    name: 'Urinalysis',
    description: 'A test of your urine. It\'s used to detect and manage a wide range of disorders, such as urinary tract infections, kidney disease, and diabetes.',
    price: 50.00,
    turnaroundTime: '24 hours',
    preparation: 'Provide a clean-catch urine sample.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'urine sample diagnostics',
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
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

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
          <Card key={test.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Image
              src={test.imageUrl}
              alt={test.name}
              width={400}
              height={300}
              className="w-full h-56 object-cover rounded-t-lg"
              data-ai-hint={test.aiHint}
            />
            <CardHeader>
              <CardTitle className="font-headline">{test.name}</CardTitle>
              <CardDescription className="text-primary font-semibold">${test.price.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
              {test.preparation && (
                <div className="flex items-start text-sm mb-2">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <p><span className="font-medium">Preparation:</span> {test.preparation}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <p><span className="font-medium">Results in:</span> {test.turnaroundTime}</p>
              </div>
            </CardContent>
            <CardContent className="border-t pt-4">
                <Button className="w-full">
                    <ClipboardList className="mr-2 h-4 w-4" /> Book This Test
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
