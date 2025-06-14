
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ActivitySquare, ShieldAlert, Wand2, Upload, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeSymptoms, type SymptomAnalyzerInput, type SymptomAnalyzerOutput } from '@/ai/flows/symptom-analyzer';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export default function SymptomAnalyzerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

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

    const input: SymptomAnalyzerInput = { symptomsDescription: symptoms };
    if (imagePreview) {
      input.imageDataUri = imagePreview;
    }

    try {
      const aiResponse = await analyzeSymptoms(input);
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
      
      <Alert variant="default" className="mb-6 bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Important Disclaimer</AlertTitle>
        <AlertDescription className="text-primary/80 dark:text-primary/90">
          This tool is for informational purposes only and does not provide medical advice. 
          It is not a substitute for professional medical diagnosis or treatment. 
          Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-xl hover-lift transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ActivitySquare className="mr-2 h-6 w-6 text-primary" /> Describe Your Symptoms</CardTitle>
            <CardDescription>
              Enter a detailed description of the symptoms you are experiencing. You can also upload an image (optional).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                placeholder="e.g., I have a persistent cough, mild fever for 3 days, and a runny nose... For skin issues, describe the appearance, location, and any changes."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={6}
                className="resize-none"
                aria-label="Symptom Description Input"
              />

              <div>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-foreground mb-1">Upload Image (Optional)</label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">Max file size: 2MB. Useful for skin conditions, visible injuries, etc.</p>
              </div>

              {imagePreview && (
                <div className="mt-4 relative group">
                  <p className="text-sm font-medium mb-1">Image Preview:</p>
                  <Image src={imagePreview} alt="Symptom Image Preview" width={200} height={200} className="rounded-md border object-contain max-h-48 w-auto shadow-md" data-ai-hint="injury symptom image"/>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={removeImage} 
                    className="absolute top-0 right-0 m-1 h-7 w-7 opacity-70 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <XCircle className="h-4 w-4"/>
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95 py-3 text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Analyze Symptoms
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover-lift transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="font-headline">Analysis Results</CardTitle>
            <CardDescription>
              Potential conditions and next steps based on your input will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex flex-col">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full flex-grow">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is thinking...</p>
              </div>
            )}
            {result && !isLoading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Potential Conditions:</h3>
                  {result.potentialConditions && result.potentialConditions.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90 dark:text-foreground/80">
                      {result.potentialConditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific conditions strongly indicated based on the input. Please provide more details or consult a doctor.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Recommended Next Steps:</h3>
                  <p className="text-sm whitespace-pre-wrap text-foreground/90 dark:text-foreground/80">{result.nextSteps}</p>
                </div>
              </div>
            )}
            {!result && !isLoading && (
              <div className="flex items-center justify-center h-full flex-grow">
                <p className="text-muted-foreground text-center">Enter your symptoms and click "Analyze Symptoms" to see results.</p>
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
