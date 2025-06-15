
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

const t = (enText: string, knText: string) => knText;

interface MedicalTest {
  id: string;
  name: string;
  nameKn: string;
  description: string;
  descriptionKn: string;
  price: number; // Price in RWF
  turnaroundTime: string; 
  turnaroundTimeKn: string;
  preparation?: string; 
  preparationKn?: string;
  imageUrl: string;
  aiHint: string;
  category: string;
  categoryKn: string;
  icon: React.ElementType;
}

const mockMedicalTests: MedicalTest[] = [
  {
    id: 'test1',
    name: 'Complete Blood Count (CBC)',
    nameKn: 'Isiporo Rusange y\'Amaraso (CBC)',
    description: 'Measures various components of your blood, including red and white blood cells, hemoglobin, and platelets.',
    descriptionKn: 'Ipima ibice bitandukanye by\'amaraso yawe, harimo uturemangingo dutukura n\'umweru, hemoglobine, na platelets.',
    price: 7500, 
    turnaroundTime: '24 hours',
    turnaroundTimeKn: 'Amasaha 24',
    preparation: 'No special preparation needed.',
    preparationKn: 'Nta myiteguro idasanzwe ikenewe.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'blood test laboratory',
    category: 'Hematology',
    categoryKn: 'Hematologie',
    icon: TestTube,
  },
  {
    id: 'test2',
    name: 'Lipid Panel',
    nameKn: 'Isiporo ry\'Ibinure',
    description: 'Measures fats and fatty substances used as a source of energy by your body. Lipids include cholesterol, triglycerides, HDL, and LDL.',
    descriptionKn: 'Ipima ibinure n\'ibintu by\'ibinure bikoreshwa nk\'isoko y\'ingufu n\'umubiri wawe. Ibinure birimo cholesterol, triglycerides, HDL, na LDL.',
    price: 12000, 
    turnaroundTime: '48 hours',
    turnaroundTimeKn: 'Amasaha 48',
    preparation: 'Fasting for 9-12 hours is typically required.',
    preparationKn: 'Ubusanzwe bisaba kwiyiriza ubusa amasaha 9-12.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'cholesterol screening medical',
    category: 'Cardiology',
    categoryKn: 'Indwara z\'Umutima',
    icon: HeartPulse,
  },
  {
    id: 'test3',
    name: 'Thyroid Stimulating Hormone (TSH) Test',
    nameKn: 'Isiporo rya TSH (Hormone Stimulating Thyroid)',
    description: 'Measures the amount of TSH in your blood. TSH is produced by the pituitary gland and helps regulate thyroid function.',
    descriptionKn: 'Ipima ingano ya TSH mu maraso yawe. TSH ikorwa na glande pituitaire kandi ifasha kugenzura imikorere ya thyroid.',
    price: 9000, 
    turnaroundTime: '2-3 days',
    turnaroundTimeKn: 'Iminsi 2-3',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'hormone test endocrinology',
    category: 'Endocrinology',
    categoryKn: 'Endocrinologie',
    icon: FlaskConical,
  },
  {
    id: 'test4',
    name: 'Urinalysis',
    nameKn: 'Isiporo ry\'Inkare',
    description: 'A test of your urine. It\'s used to detect and manage a wide range of disorders, such as urinary tract infections, kidney disease, and diabetes.',
    descriptionKn: 'Ni isiporo ry\'inkare zawe. Rikoreshwa mu kumenya no gucunga indwara nyinshi, nk\'indwara z\'umuyoboro w\'inkari, indwara z\'impyiko, na diyabete.',
    price: 5000, 
    turnaroundTime: '24 hours',
    turnaroundTimeKn: 'Amasaha 24',
    preparation: 'Provide a clean-catch urine sample.',
    preparationKn: 'Tanga icyitegererezo cy\'inkare zisukuye.',
    imageUrl: 'https://placehold.co/400x300.png',
    aiHint: 'urine sample diagnostics',
    category: 'Pathology',
    categoryKn: 'Patologie',
    icon: Microscope,
  },
];

export default function MedicalTestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [medicalTests, setMedicalTests] = useState<MedicalTest[]>([]);

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching medical tests (ephemeral)
    const fetchTests = async () => {
        setIsLoadingPage(true);
        // Conceptual: const response = await fetch('/api/medical-tests');
        // Conceptual: const data = await response.json();
        // Conceptual: setMedicalTests(data.tests || []);
        await new Promise(resolve => setTimeout(resolve, 300));
        setMedicalTests(mockMedicalTests);
        setIsLoadingPage(false);
    };
    fetchTests();
  }, []);


  const handleBookTest = (testName: string) => {
    toast({
      title: t("Gufata Igihe cy'Isiporo Byatangiye (Igerageza)", "Gufata Igihe cy'Isiporo Byatangiye (Igerageza)"),
      description: t(`Watangiye gahunda yo gufata isiporo ya ${testName}. Nyamuneka kurikiza intambwe zikurikira. Amakuru ntazabikwa muri iyi prototype.`, `Watangiye gahunda yo gufata isiporo ya ${testName}. Nyamuneka kurikiza intambwe zikurikira. Amakuru ntazabikwa muri iyi prototype.`),
    });
    // In a real app, this might navigate to /appointments/book with pre-filled test info or a specific booking flow.
  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Available Medical Tests", "Ibipimo bya Muganga Biboneka")} />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Gutegura ibipimo bya muganga...", "Gutegura ibipimo bya muganga...")}</p>
        </div>
      </AppLayout>
    );
  }
  
  // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }


  return (
    <AppLayout>
      <PageHeader title={t("Available Medical Tests", "Ibipimo bya Muganga Biboneka")} breadcrumbs={[{label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/"}, {label: t("Ibipimo bya Muganga", "Ibipimo bya Muganga")}]}/>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicalTests.map((test) => (
          <Card key={test.id} className="flex flex-col shadow-lg hover-lift group dark:border-border">
            <div className="relative overflow-hidden rounded-t-lg">
              <Image
                src={test.imageUrl}
                alt={test.nameKn}
                width={400}
                height={250}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={test.aiHint}
              />
              <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 dark:bg-background/70 backdrop-blur-sm">
                <test.icon className="mr-1.5 h-4 w-4 text-muted-foreground"/> {test.categoryKn}
              </Badge>
            </div>
            <CardHeader className="pt-4">
              <CardTitle className="font-headline group-hover:text-primary transition-colors">{test.nameKn}</CardTitle>
              <CardDescription className="text-primary font-semibold text-lg">{test.price.toLocaleString()} RWF</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <p className="text-sm text-muted-foreground">{test.descriptionKn}</p>
              {test.preparationKn && (
                <div className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <p><span className="font-medium text-foreground">{t("Imyiteguro:", "Imyiteguro:")}</span> {test.preparationKn}</p>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 text-accent flex-shrink-0" />
                <p><span className="font-medium text-foreground">{t("Ibisubizo muri:", "Ibisubizo muri:")}</span> {test.turnaroundTimeKn}</p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <Button 
                  onClick={() => handleBookTest(test.nameKn)}
                  className="w-full transition-transform hover:scale-105 active:scale-95"
                >
                    <ClipboardList className="mr-2 h-4 w-4" /> {t("Fata Igihe Cy'isuzuma", "Fata Igihe Cy'isuzuma")}
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
