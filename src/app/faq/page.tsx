
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MessageSquareQuote, HelpCircle, Send, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { answerMedicalQuestion, type AnswerMedicalQuestionOutput } from '@/ai/flows/medical-faq';
import { useRouter } from 'next/navigation';

// Kinyarwanda is default
const t = (enText: string, knText: string) => knText; 

interface FAQItem {
  question: string;
  questionKn: string;
  answer: string;
  answerKn: string;
}

// Mock data, would come from backend or CMS in a real app
const commonFAQs: FAQItem[] = [
  { question: "What are the common symptoms of the flu?", questionKn: "Ni ibihe bimenyetso bikunze kugaragara bya grippe?", answer: "Common flu symptoms include fever, cough, sore throat, runny or stuffy nose, muscle or body aches, headaches, and fatigue. Some people may have vomiting and diarrhea, though this is more common in children than adults.", answerKn: "Ibimenyetso bikunze kugaragara bya grippe birimo umuriro, gukorora, kubabara mu muhogo, kuzibura cyangwa kugira ibimyira, kubabara imitsi cyangwa umubiri wose, kubabara umutwe, n'umunaniro. Bamwe bashobora kuruka no guhitwa, nubwo ibi bikunze kuba ku bana kuruta ku bantu bakuru." },
  { question: "How can I prevent catching a cold?", questionKn: "Nigute nakwirinda kwandura ibicurane?", answer: "To prevent colds, wash your hands frequently, avoid touching your face, get enough sleep, eat a healthy diet, and avoid close contact with people who are sick.", answerKn: "Kugirango wirinde ibicurane, karaba intoki kenshi, irinde kwikoza mu maso, siba bihagije, rya indyo yuzuye, kandi wirinde kwegera abantu barwaye." },
  { question: "When should I see a doctor for a fever?", questionKn: "Ni ryari ngomba kujya kwa muganga kubera umuriro?", answer: "See a doctor if your fever is 103°F (39.4°C) or higher, or if you've had a fever for more than three days. For infants and young children, consult a doctor for any fever.", answerKn: "Jya kwa muganga niba umuriro wawe uri 103°F (39.4°C) cyangwa urenga, cyangwa niba umaze iminsi irenga itatu ufite umuriro. Ku ruhinja n'abana bato, gana muganga ku muriro uwo ariwo wose." },
];

export default function FaqPage() {
  const router = useRouter(); 
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<AnswerMedicalQuestionOutput | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [displayedFaqs, setDisplayedFaqs] = useState<FAQItem[]>([]); // Start empty, then load mock

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching common FAQs (ephemeral)
    const fetchFAQs = async () => {
        setIsLoadingPage(true);
        // Conceptual: const response = await fetch('/api/faqs/common');
        // Conceptual: const data = await response.json();
        // Conceptual: setDisplayedFaqs(data.faqs || []);
        await new Promise(resolve => setTimeout(resolve, 300));
        setDisplayedFaqs(commonFAQs);
        setIsLoadingPage(false);
    };
    fetchFAQs();
  }, []);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) {
      toast({
        variant: "destructive",
        title: t("Input Required", "Amakuru Arasabwa"),
        description: t("Please enter your medical question.", "Nyamuneka andika ikibazo cyawe cy'ubuvuzi."),
      });
      return;
    }

    setIsLoadingAi(true);
    setAiAnswer(null);

    try {
      // In a full-stack app, this call would ideally go to your backend,
      // which then calls the Genkit flow securely.
      const response = await answerMedicalQuestion({ question });
      setAiAnswer(response);
      toast({ title: t("AI Answer Received", "Igisubizo cya AI Cyabonetse"), description: t("This is a prototype, AI responses are informational only.", "Ibi ni igerageza, ibisubizo bya AI ni iby'amakuru gusa.")});
    } catch (error) {
      console.error("Medical FAQ Error:", error);
      toast({
        variant: "destructive",
        title: t("Failed to get answer", "Kuvana Igisubizo Byanze"),
        description: t("Could not process your question at this time. Please try again later. (This is a prototype, ensure Genkit flow is accessible)", "Ntibishoboye gukemura ikibazo cyawe muri iki gihe. Nyamuneka gerageza nyuma. (Ibi ni igerageza, menya neza ko inzira ya Genkit iboneka)"),
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Medical FAQ", "Ibibazo Bikunze Kubazwa mu Buvuzi")} />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Medical FAQ...", "Gutegura Ibibazo Bikunze Kubazwa...")}</p>
        </div>
      </AppLayout>
    );
  }
  
  // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }


  return (
    <AppLayout>
      <PageHeader title={t("Medical FAQ", "Ibibazo Bikunze Kubazwa mu Buvuzi")} breadcrumbs={[{label: t("Dashboard", "Imbonerahamwe"), href: "/"}, {label: t("FAQ", "Ibibazo Bikunze Kubazwa")}]}/>
      
      <Alert variant="default" className="mb-8 bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">{t("Informational Use Only", "Koresha ku Bw'amakuru Gusa")}</AlertTitle>
        <AlertDescription className="text-primary/80 dark:text-primary/90">
          {t("The information provided here is for general knowledge and informational purposes only, and does not constitute medical advice. It is essential to consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.",
             "Amakuru atangwa hano ni ayo kumenya rusange no gutanga amakuru gusa, kandi ntabwo ari inama z'ubuvuzi. Ni ngombwa kugisha inama umuganga w'umwuga wujuje ibisabwa ku bibazo byose by'ubuzima cyangwa mbere yo gufata ibyemezo bijyanye n'ubuzima bwawe cyangwa ubuvuzi.")}
        </AlertDescription>
      </Alert>

      <Card className="mb-8 shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><HelpCircle className="mr-2 h-6 w-6 text-primary" /> {t("Ask a Medical Question", "Baza Ikibazo cy'Ubuvuzi")}</CardTitle>
          <CardDescription>
            {t("Type your medical question below, and our AI will try to provide an answer based on common medical knowledge. This is a prototype feature.",
               "Andika ikibazo cyawe cy'ubuvuzi hano hepfo, kandi AI yacu izagerageza gutanga igisubizo gishingiye ku bumenyi rusange bw'ubuvuzi. Iki ni igice cy'igerageza.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder={t("e.g., What are the side effects of paracetamol?", "urugero: Ni izihe ngaruka za parasetamoli?")}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-grow"
              aria-label={t("Medical Question Input", "Ahandikirwa Ikibazo cy'Ubuvuzi")}
            />
            <Button type="submit" disabled={isLoadingAi} className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
              {isLoadingAi ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Getting Answer...", "Kubona Igisubizo...")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("Ask Question", "Baza Ikibazo")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {aiAnswer && !isLoadingAi && (
        <Card className="mb-8 shadow-lg bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
          <CardHeader>
            <CardTitle className="font-headline text-green-700 dark:text-green-400">{t("AI Generated Answer", "Igisubizo Cyatanzwe na AI")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 dark:text-green-300 whitespace-pre-wrap">{aiAnswer.answer}</p>
          </CardContent>
        </Card>
      )}
      
      {isLoadingAi && !aiAnswer && (
        <div className="flex justify-center items-center my-8 p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t("Fetching answer from AI...", "Kuzana igisubizo muri AI...")}</p>
        </div>
      )}

      <Card className="shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><MessageSquareQuote className="mr-2 h-6 w-6 text-primary" /> {t("Commonly Asked Questions", "Ibibazo Bikunze Kubazwa")}</CardTitle>
        </CardHeader>
        <CardContent>
          {displayedFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {displayedFaqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left hover:no-underline font-medium group">
                    <span className="group-hover:text-primary transition-colors">{faq.questionKn}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                    {faq.answerKn}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">{t("No common FAQs to display at the moment.", "Nta bibazo bikunze kubazwa bihari muri iki gihe.")}</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
