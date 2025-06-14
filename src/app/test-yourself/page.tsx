
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

export default function TestYourselfPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<TestYourselfOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
          description: "Please log in to use the Test Yourself feature.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!symptoms.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please describe your symptoms or concerns.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const aiResponse = await testYourself({ symptoms });
      setResult(aiResponse);
    } catch (error) {
      console.error("Test Yourself Error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not process your input at this time. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Test Yourself...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Test Yourself" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Test Yourself"}]} />
      
      <Alert variant="default" className="mb-6 bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Important Disclaimer</AlertTitle>
        <AlertDescription className="text-primary/80 dark:text-primary/90">
          This tool acts like a medical reference manual to cross-reference symptoms and is for informational purposes only. 
          It does NOT provide a diagnosis and is NOT a substitute for professional medical advice. 
          Always consult a qualified healthcare provider for any health concerns. Do not disregard professional medical advice or delay seeking it because of something you have read or inferred from this tool.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FlaskConical className="mr-2 h-6 w-6 text-primary" /> Describe Your Symptoms</CardTitle>
            <CardDescription>
              Enter your symptoms or health concerns. Our AI will provide potential insights based on a medical reference approach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                placeholder="e.g., I've been feeling tired, have a persistent headache, and occasional dizziness..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={8}
                className="resize-none"
                aria-label="Symptoms or Concerns Input"
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get Potential Insights
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="font-headline">Potential Insights</CardTitle>
            <CardDescription>
              Information based on your input will appear below.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is cross-referencing symptoms...</p>
              </div>
            )}
            {result && !isLoading && (
              <Accordion type="multiple" defaultValue={['conditions', 'advice', 'disclaimer']} className="w-full">
                <AccordionItem value="conditions">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline group">
                    <div className="flex items-center">
                        <ListChecks className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse"/> Potential Conditions
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pl-2 space-y-3">
                    {result.potentialConditions && result.potentialConditions.length > 0 && result.potentialConditions.some(c => c.name) ? (
                      result.potentialConditions.filter(c => c.name).map((condition, index) => (
                        <Card key={index} className="p-3 bg-background/50 dark:bg-muted/20">
                          <h4 className="font-semibold text-primary">{condition.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{condition.description}</p>
                          {condition.commonSymptoms && condition.commonSymptoms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-foreground">Common Symptoms:</p>
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
                      <p className="text-sm text-muted-foreground">No specific potential conditions strongly indicated based on the input, or symptoms are very general. This is not a diagnosis.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="advice">
                   <AccordionTrigger className="text-lg font-semibold hover:no-underline group">
                        <div className="flex items-center">
                            <ClipboardPlus className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse"/> General Advice
                        </div>
                   </AccordionTrigger>
                  <AccordionContent className="pt-2 pl-2">
                    <p className="text-sm whitespace-pre-wrap text-foreground/90">{result.generalAdvice || "Maintain a healthy lifestyle, stay hydrated, get adequate rest, and consult a doctor for personalized advice if symptoms persist or worsen."}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="disclaimer">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline group">
                        <div className="flex items-center">
                             <Info className="mr-3 h-5 w-5 text-destructive group-hover:animate-pulse"/> Important Disclaimer
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
                <p className="text-muted-foreground">Enter your symptoms above and click "Get Potential Insights" to see results from our AI medical reference.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

