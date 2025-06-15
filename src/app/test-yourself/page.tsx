
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FlaskConical, ShieldAlert, Lightbulb, ListChecks, ClipboardPlus, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testYourself, type TestYourselfOutput } from '@/ai/flows/test-yourself';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Translation helper
const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda


export default function TestYourselfPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 

  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<TestYourselfOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  useEffect(() => {
    setIsClient(true);
    // Simulate initial setup if needed
    setIsLoadingPage(false);
  }, []);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!symptoms.trim()) {
      toast({
        variant: "destructive",
        title: t("Input Required", "Amakuru Arasabwa"),
        description: t("Please describe your symptoms or concerns.", "Nyamuneka sobanura ibimenyetso byawe cyangwa ibikuhangayikishije."),
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Conceptual: const response = await fetch('/api/ai/test-yourself', { method: 'POST', body: JSON.stringify({symptoms})});
      // Conceptual: const aiResponse = await response.json();
      const aiResponse = await testYourself({ symptoms }); // Direct call for prototype
      setResult(aiResponse);
    } catch (error) {
      console.error("Test Yourself Error:", error);
      toast({
        variant: "destructive",
        title: t("Analysis Failed", "Isesengura Ryanze"),
        description: t("Could not process your input at this time. Please try again later.", "Ntibishoboye gusesengura amakuru watanze muri iki gihe. Nyamuneka gerageza nyuma."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("Test Yourself", "Isúzumé Ubwawe")} 
            breadcrumbs={[
                {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
                {label: t("Test Yourself", "Isúzumé Ubwawe")}
            ]}
          />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Test Yourself...", "Gutegura Isuzume Ubwawe...")}</p>
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
        title={t("Test Yourself", "Isúzumé Ubwawe")} 
        breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Test Yourself", "Isúzumé Ubwawe")}
        ]}
      />
      
      <Alert variant="default" className="mb-6 bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">{t("Important Disclaimer", "Itangazo Ry'ingenzi")}</AlertTitle>
        <AlertDescription className="text-primary/80 dark:text-primary/90">
          {t("This tool acts like a medical reference manual to cross-reference symptoms and is for informational purposes only. It does NOT provide a diagnosis and is NOT a substitute for professional medical advice. Always consult a qualified healthcare provider for any health concerns. Do not disregard professional medical advice or delay seeking it because of something you have read or inferred from this tool.", 
             "Iki gikoresho gikora nk'igitabo cy'ubuvuzi cyo kugereranya ibimenyetso kandi ni icyo gutanga amakuru gusa. NTABWO gitanga isuzuma kandi NTABWO gisimbura inama z'abaganga b'umwuga. Buri gihe shaka inama z'umuganga w'umwuga ku bibazo byose by'ubuzima. Ntukirengagize inama z'abaganga b'umwuga cyangwa ngo utinde kuzishaka kubera ibyo wasomye cyangwa watekereje muri iki gikoresho.")}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FlaskConical className="mr-2 h-6 w-6 text-primary" /> {t("Describe Your Symptoms", "Sobanura Ibimenyetso Byawe")}</CardTitle>
            <CardDescription>
              {t("Enter your symptoms or health concerns. Our AI will provide potential insights based on a medical reference approach.", 
                 "Andika ibimenyetso byawe cyangwa ibikuhangayikishije. AI yacu izaguha amakuru ashoboka ashingiye ku buryo bwo kugereranya n'ibitabo by'ubuvuzi.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                placeholder={t("e.g., I've been feeling tired, have a persistent headache, and occasional dizziness...", 
                               "urugero: Numvise umunaniro, mfite umutwe udakira, kandi rimwe na rimwe nzirungaguzwa...")}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={8}
                className="resize-none"
                aria-label={t("Symptoms or Concerns Input", "Andika Ibimenyetso cyangwa Ibihangayikishije")}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Analyzing Symptoms...", "Gusesengura Ibimenyetso...")}
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {t("Get Potential Insights", "Menya Amakuru Ashoboka")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="font-headline">{t("Potential Insights", "Amakuru Ashoboka")}</CardTitle>
            <CardDescription>
              {t("Information based on your input will appear below.", 
                 "Amakuru ashingiye ku byo wanditse azagaragara hano hepfo.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">{t("AI is cross-referencing symptoms...", "AI iri kugereranya ibimenyetso...")}</p>
              </div>
            )}
            {result && !isLoading && (
              <Accordion type="multiple" defaultValue={['conditions', 'advice', 'disclaimer']} className="w-full">
                <AccordionItem value="conditions">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline group">
                    <div className="flex items-center">
                        <ListChecks className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse"/> {t("Potential Conditions", "Indwara Zishoboka")}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pl-2 space-y-3">
                    {result.potentialConditions && result.potentialConditions.length > 0 && result.potentialConditions.some(c => c.name) ? (
                      result.potentialConditions.filter(c => c.name).map((condition, index) => (
                        <Card key={index} className="p-3 bg-background/50 dark:bg-muted/20">
                          <h4 className="font-semibold text-primary">{condition.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{condition.description}</p>
                          {condition.commonSymptoms && condition.commonSymptoms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-foreground">{t("Common Symptoms:", "Ibimenyetso Bikunze Kugaragara:")}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {condition.commonSymptoms.map(symptom => (
                                  <Badge key={symptom} variant="secondary" className="text-xs">{symptom}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("No specific potential conditions strongly indicated based on the input, or symptoms are very general. This is not a diagnosis.", 
                           "Nta ndwara zihariye zishobora kugaragara cyane zishingiye ku makuru watanze, cyangwa ibimenyetso ni rusange cyane. Iri si isuzuma.")}
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="advice">
                   <AccordionTrigger className="text-lg font-semibold hover:no-underline group">
                        <div className="flex items-center">
                            <ClipboardPlus className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse"/> {t("General Advice", "Inama Rusange")}
                        </div>
                   </AccordionTrigger>
                  <AccordionContent className="pt-2 pl-2">
                    <p className="text-sm whitespace-pre-wrap text-foreground/90">
                        {result.generalAdvice || t("Maintain a healthy lifestyle, stay hydrated, get adequate rest, and consult a doctor for personalized advice if symptoms persist or worsen.", 
                                                    "Komeza kubaho neza, nywa amazi ahagije, ruhuka bihagije, kandi ugane muganga kugirango aguhe inama zihariye niba ibimenyetso bikomeje cyangwa bikiyongera.")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="disclaimer">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline group">
                        <div className="flex items-center">
                             <Info className="mr-3 h-5 w-5 text-destructive group-hover:animate-pulse"/> {t("Important Disclaimer", "Itangazo Ry'ingenzi")}
                        </div>
                    </AccordionTrigger>
                  <AccordionContent className="pt-2 pl-2">
                    <p className="text-xs text-destructive/80 dark:text-destructive/70 whitespace-pre-wrap">{result.disclaimer}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {!result && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                 <FlaskConical className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                    {t("Enter your symptoms above and click \"Get Potential Insights\" to see results from our AI medical reference.",
                       "Andika ibimenyetso byawe haruguru hanyuma ukande \"Menya Amakuru Ashoboka\" kugirango ubone ibisubizo bivuye mu bushakashatsi bwacu bwa AI.")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

