"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FlaskConical, ShieldAlert, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testYourself, type TestYourselfOutput } from '@/ai/flows/test-yourself';

export default function TestYourselfPage() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<TestYourselfOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <AppLayout>
      <PageHeader title="Test Yourself" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Test Yourself"}]} />
      
      <Alert variant="default" className="mb-6 bg-primary/10 border-primary/30">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Important Disclaimer</AlertTitle>
        <AlertDescription className="text-primary/80">
          This tool acts like a medical reference manual to cross-reference symptoms and is for informational purposes only. 
          It does NOT provide a diagnosis and is NOT a substitute for professional medical advice. 
          Always consult a qualified healthcare provider for any health concerns. Do not disregard professional medical advice or delay seeking it because of something you have read or inferred from this tool.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FlaskConical className="mr-2 h-6 w-6 text-primary" /> Describe Your Symptoms</CardTitle>
            <CardDescription>
              Enter your symptoms or health concerns. Our AI will provide potential disease information and treatment/prevention suggestions based on a medical reference approach.
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
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

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Potential Insights</CardTitle>
            <CardDescription>
              Information based on your input will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is cross-referencing symptoms...</p>
              </div>
            )}
            {result && !isLoading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Potential Diseases/Conditions:</h3>
                  <p className="text-sm whitespace-pre-wrap">{result.potentialDiseases || "No specific potential diseases identified. This could be due to vague symptoms or a need for more specific input. Please remember this is not a diagnosis."}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Treatment & Prevention Information:</h3>
                  <p className="text-sm whitespace-pre-wrap">{result.treatmentPreventionInfo || "General advice: maintain a healthy lifestyle, stay hydrated, get adequate rest, and consult a doctor for personalized advice."}</p>
                </div>
              </div>
            )}
            {!result && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Enter your symptoms and click "Get Potential Insights" to see results.</p>
              </div>
            )}
          </CardContent>
           <CardFooter>
             <p className="text-xs text-muted-foreground">
                Disclaimer: The information provided is for educational purposes only and not a medical diagnosis. Always consult a healthcare professional.
             </p>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
