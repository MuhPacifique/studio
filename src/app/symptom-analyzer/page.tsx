
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

const t = (enText: string, knText: string) => knText;

export default function SymptomAnalyzerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    setIsLoadingPage(false);
  }, []);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: t("Ifoto ni Nini Cyane", "Ifoto ni Nini Cyane"),
          description: t("Nyamuneka hitamo ifoto iri munsi ya 2MB.", "Nyamuneka hitamo ifoto iri munsi ya 2MB."),
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
      fileInputRef.current.value = ""; 
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!symptoms.trim()) {
      toast({
        variant: "destructive",
        title: t("Input Required", "Amakuru Arasabwa"),
        description: t("Please describe your symptoms.", "Nyamuneka sobanura ibimenyetso byawe."),
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
      // Call Genkit flow (direct call for prototype, backend call in production)
      const aiResponse = await analyzeSymptoms(input);
      setResult(aiResponse);
      toast({title: t("Analysis Complete (Prototype)", "Isesengura Ryarangiye (Igerageza)"), description: t("AI results are for informational purposes.", "Ibisubizo bya AI ni iby'amakuru gusa.")})
    } catch (error) {
      console.error("Symptom Analyzer Error:", error);
      toast({
        variant: "destructive",
        title: t("Analysis Failed", "Isesengura Ryanze"),
        description: t("Could not analyze symptoms at this time. Please try again later.", "Ntibishoboye gusesengura ibimenyetso muri iki gihe. Nyamuneka gerageza nyuma."),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Symptom Analyzer", "Isesengura ry'Ibimenyetso")} />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Symptom Analyzer...", "Gutegura Isesengura ry'Ibimenyetso...")}</p>
        </div>
      </AppLayout>
    );
  }

  // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }


  return (
    <AppLayout>
      <PageHeader title={t("Symptom Analyzer", "Isesengura ry'Ibimenyetso")} breadcrumbs={[{label: t("Dashboard", "Imbonerahamwe"), href: "/"}, {label: t("Symptom Analyzer", "Isesengura ry'Ibimenyetso")}]} />
      
      <Alert variant="default" className="mb-6 bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">{t("Important Disclaimer", "Itangazo Ry'ingenzi")}</AlertTitle>
        <AlertDescription className="text-primary/80 dark:text-primary/90">
          {t("This tool is for informational purposes only and does not provide medical advice. It is not a substitute for professional medical diagnosis or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.", "Iki gikoresho ni icyo gutanga amakuru gusa kandi ntigitanga inama z'ubuvuzi. Ntabwo gisimbura isuzuma ry'abaganga b'umwuga cyangwa ubuvuzi. Buri gihe shaka inama z'umuganga wawe cyangwa undi mukozi w'ubuzima wujuje ibisabwa ku bibazo byose waba ufite bijyanye n'ubuzima.")}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-xl hover-lift transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ActivitySquare className="mr-2 h-6 w-6 text-primary" /> {t("Describe Your Symptoms", "Sobanura Ibimenyetso Byawe")}</CardTitle>
            <CardDescription>
              {t("Enter a detailed description of the symptoms you are experiencing. You can also upload an image (optional).", "Andika ibisobanuro birambuye by'ibimenyetso ufite. Ushobora no gushyiramo ifoto (si itegeko).")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                placeholder={t("e.g., I have a persistent cough, mild fever for 3 days, and a runny nose... For skin issues, describe the appearance, location, and any changes.", "urugero: Mfite inkorora idakira, umuriro muke mu minsi 3, n'ibimyira... Ku bibazo by'uruhu, sobanura uko bigaragara, aho biri, n'impinduka zose.")}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={6}
                className="resize-none"
                aria-label={t("Symptom Description Input", "Ahandikirwa Ibisobanuro by'Ibimenyetso")}
              />

              <div>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-foreground mb-1">{t("Upload Image (Optional)", "Shyiramo Ifoto (Si Itegeko)")}</label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">{t("Max file size: 2MB. Useful for skin conditions, visible injuries, etc.", "Ingano ntarengwa y'ifoto: 2MB. Ifasha ku bibazo by'uruhu, ibikomere bigaragara, n'ibindi.")}</p>
              </div>

              {imagePreview && (
                <div className="mt-4 relative group">
                  <p className="text-sm font-medium mb-1">{t("Image Preview:", "Ifoto y'Igeragezwa:")}</p>
                  <Image src={imagePreview} alt={t("Symptom Image Preview", "Ifoto y'Ibimenyetso (Igeragezwa)")} width={200} height={200} className="rounded-md border object-contain max-h-48 w-auto shadow-md" data-ai-hint="injury symptom image"/>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={removeImage} 
                    className="absolute top-0 right-0 m-1 h-7 w-7 opacity-70 group-hover:opacity-100 transition-opacity"
                    aria-label={t("Remove image", "Kura ifoto")}
                  >
                    <XCircle className="h-4 w-4"/>
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95 py-3 text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("Analyzing...", "Gusesengura...")}
                  </>
                ) : (
                  <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  {t("Analyze Symptoms", "Sengura Ibimenyetso")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover-lift transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="font-headline">{t("Analysis Results", "Ibisubizo by'Isesengura")}</CardTitle>
            <CardDescription>
              {t("Potential conditions and next steps based on your input will appear here.", "Indwara zishoboka n'intambwe zikurikira zishingiye ku byo wanditse bizagaragara hano.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex flex-col">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full flex-grow">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">{t("AI is thinking...", "AI iri gutekereza...")}</p>
              </div>
            )}
            {result && !isLoading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">{t("Potential Conditions:", "Indwara Zishoboka:")}</h3>
                  {result.potentialConditions && result.potentialConditions.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90 dark:text-foreground/80">
                      {result.potentialConditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("No specific conditions strongly indicated based on the input. Please provide more details or consult a doctor.", "Nta ndwara zihariye zigaragara cyane zishingiye ku byo wanditse. Nyamuneka tanga ibisobanuro birambuye cyangwa ugane muganga.")}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">{t("Recommended Next Steps:", "Intambwe Zikurikira Zisabwa:")}</h3>
                  <p className="text-sm whitespace-pre-wrap text-foreground/90 dark:text-foreground/80">{result.nextSteps}</p>
                </div>
                 <div className="pt-4 mt-4 border-t">
                    <h3 className="text-md font-semibold mb-1 text-destructive">{t("Disclaimer:", "Itangazo Ry'ingenzi:")}</h3>
                    <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
                </div>
              </div>
            )}
            {!result && !isLoading && (
              <div className="flex items-center justify-center h-full flex-grow">
                <p className="text-muted-foreground text-center">{t("Enter your symptoms and click \"Analyze Symptoms\" to see results.", "Andika ibimenyetso byawe hanyuma ukande \"Sengura Ibimenyetso\" kugirango ubone ibisubizo.")}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground">
                {t("Remember: This AI analysis is not a diagnosis. Consult a healthcare professional for medical advice.", "Wibuke: Iri sesengura rya AI si isuzuma. Gana umuganga w'umwuga kugirango aguhe inama z'ubuvuzi.")}
             </p>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
