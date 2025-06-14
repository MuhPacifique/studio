
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

interface FAQItem {
  question: string;
  answer: string;
}

const commonFAQs: FAQItem[] = [
  { question: "What are the common symptoms of the flu?", answer: "Common flu symptoms include fever, cough, sore throat, runny or stuffy nose, muscle or body aches, headaches, and fatigue. Some people may have vomiting and diarrhea, though this is more common in children than adults." },
  { question: "How can I prevent catching a cold?", answer: "To prevent colds, wash your hands frequently, avoid touching your face, get enough sleep, eat a healthy diet, and avoid close contact with people who are sick." },
  { question: "When should I see a doctor for a fever?", answer: "See a doctor if your fever is 103°F (39.4°C) or higher, or if you've had a fever for more than three days. For infants and young children, consult a doctor for any fever." },
];

export default function FaqPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<AnswerMedicalQuestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedFaqs, setDisplayedFaqs] = useState<FAQItem[]>(commonFAQs);

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
          description: "Please log in to access the Medical FAQ.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter your medical question.",
      });
      return;
    }

    setIsLoading(true);
    setAiAnswer(null);

    try {
      const response = await answerMedicalQuestion({ question });
      setAiAnswer(response);
    } catch (error)
    {
      console.error("Medical FAQ Error:", error);
      toast({
        variant: "destructive",
        title: "Failed to get answer",
        description: "Could not process your question at this time. Please try again later.",
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
          <p className="text-muted-foreground">Loading Medical FAQ...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Medical FAQ" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "FAQ"}]}/>
      
      <Alert variant="default" className="mb-8 bg-primary/10 border-primary/30">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">Informational Use Only</AlertTitle>
        <AlertDescription className="text-primary/80">
          The information provided here is for general knowledge and informational purposes only, and does not constitute medical advice. 
          It is essential to consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.
        </AlertDescription>
      </Alert>

      <Card className="mb-8 shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><HelpCircle className="mr-2 h-6 w-6 text-primary" /> Ask a Medical Question</CardTitle>
          <CardDescription>
            Type your medical question below, and our AI will try to provide an answer based on common medical knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="e.g., What are the side effects of paracetamol?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-grow"
              aria-label="Medical Question Input"
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Answer...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ask Question
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {aiAnswer && !isLoading && (
        <Card className="mb-8 shadow-lg bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
          <CardHeader>
            <CardTitle className="font-headline text-green-700 dark:text-green-400">AI Generated Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 dark:text-green-300 whitespace-pre-wrap">{aiAnswer.answer}</p>
          </CardContent>
        </Card>
      )}
      
      {isLoading && !aiAnswer && (
        <div className="flex justify-center items-center my-8 p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Fetching answer from AI...</p>
        </div>
      )}

      <Card className="shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><MessageSquareQuote className="mr-2 h-6 w-6 text-primary" /> Commonly Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {displayedFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {displayedFaqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left hover:no-underline font-medium group">
                    <span className="group-hover:text-primary transition-colors">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">No common FAQs to display at the moment.</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
