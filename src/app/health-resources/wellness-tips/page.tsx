
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, HeartPulse, Lightbulb, Zap, Leaf, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface WellnessTip {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'Physical' | 'Mental' | 'Nutrition' | 'Sleep';
}

const mockWellnessTips: WellnessTip[] = [
  { id: 'tip1', title: 'Stay Hydrated', description: 'Drink at least 8 glasses of water a day. Proper hydration is crucial for energy levels, brain function, and overall health.', icon: Zap, category: 'Physical' },
  { id: 'tip2', title: 'Mindful Moments', description: 'Take 5-10 minutes each day for mindfulness or meditation. It can significantly reduce stress and improve focus.', icon: Lightbulb, category: 'Mental' },
  { id: 'tip3', title: 'Eat More Greens', description: 'Incorporate a variety of leafy greens and colorful vegetables into your meals for essential vitamins and minerals.', icon: Leaf, category: 'Nutrition' },
  { id: 'tip4', title: 'Consistent Sleep Schedule', description: 'Try to go to bed and wake up around the same time every day, even on weekends, to regulate your body\'s internal clock.', icon: Moon, category: 'Sleep' },
  { id: 'tip5', title: 'Regular Movement', description: 'Aim for at least 30 minutes of moderate physical activity most days of the week. This could be a brisk walk, cycling, or dancing.', icon: HeartPulse, category: 'Physical'},
  { id: 'tip6', title: 'Limit Processed Foods', description: 'Reduce your intake of processed foods, sugary drinks, and unhealthy fats. Opt for whole, unprocessed foods whenever possible.', icon: Leaf, category: 'Nutrition'},
];


export default function WellnessTipsPage() {
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
          description: "Please log in to view wellness tips.",
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
          <p className="text-muted-foreground">Loading wellness tips...</p>
        </div>
      </AppLayout>
    );
  }

  const groupedTips = mockWellnessTips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = [];
    }
    acc[tip.category].push(tip);
    return acc;
  }, {} as Record<WellnessTip['category'], WellnessTip[]>);

  return (
    <AppLayout>
      <PageHeader 
        title="Daily Wellness Tips" 
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "Health Resources"}, 
          {label: "Wellness Tips"}
        ]}
      />
      
      <div className="space-y-6">
        {Object.entries(groupedTips).map(([category, tips]) => (
          <Card key={category} className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center text-primary">
                {/* You might want more specific icons per category later */}
                {category === 'Physical' && <HeartPulse className="mr-2 h-5 w-5" />}
                {category === 'Mental' && <Lightbulb className="mr-2 h-5 w-5" />}
                {category === 'Nutrition' && <Leaf className="mr-2 h-5 w-5" />}
                {category === 'Sleep' && <Moon className="mr-2 h-5 w-5" />}
                {category} Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {tips.map((tip) => (
                  <AccordionItem value={tip.id} key={tip.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <tip.icon className="mr-3 h-5 w-5 text-accent flex-shrink-0" />
                        <span className="font-medium">{tip.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8">
                      {tip.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
