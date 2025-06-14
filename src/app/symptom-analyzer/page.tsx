
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ActivitySquare, ShieldAlert, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeSymptoms, type SymptomAnalyzerOutput } from '@/ai/flows/symptom-analyzer';
import { useRouter } from 'next/navigation';

export default function SymptomAnalyzerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomAnalyzerOutput | null>(null);
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
          description: "Please log in to use the Symptom Analyzer.",
        });
        router.replace('/login');
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
        description: "Please describe your symptoms.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const aiResponse = await analyzeSymptoms({ symptomsDescription: symptoms });
      setResult(aiResponse);
    } catch (error) {
      console.error("Symptom Analyzer Error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze symptoms at this time. Please try again later.",
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
          <p className="text-muted-foreground">Loading Symptom Analyzer...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Symptom Analyzer" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Symptom Analyzer"}]} />
      
      <Alert variant="default" className="mb-6 bg-primary/10 border-primary/30">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Important Disclaimer</AlertTitle>
        <AlertDescription className="text-primary/80">
          This tool is for informational purposes only and does not provide medical advice. 
          It is not a substitute for professional medical diagnosis or treatment. 
          Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ActivitySquare className="mr-2 h-6 w-6 text-primary" /> Describe Your Symptoms</CardTitle>
            <CardDescription>
              Enter a detailed description of the symptoms you are experiencing. The more details you provide, the better the analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                placeholder="e.g., I have a persistent cough, mild fever for 3 days, and a runny nose..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={8}
                className="resize-none"
                aria-label="Symptom Description Input"
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Analyze Symptoms
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Analysis Results</CardTitle>
            <CardDescription>
              Potential conditions and next steps based on your input will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is thinking...</p>
              </div>
            )}
            {result && !isLoading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Potential Conditions:</h3>
                  {result.potentialConditions && result.potentialConditions.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {result.potentialConditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific conditions identified based on the input. Please provide more details or consult a doctor.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Recommended Next Steps:</h3>
                  <p className="text-sm whitespace-pre-wrap">{result.nextSteps}</p>
                </div>
              </div>
            )}
            {!result && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Enter your symptoms and click "Analyze Symptoms" to see results.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground">
                Remember: This AI analysis is not a diagnosis. Consult a healthcare professional for medical advice.
             </p>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
