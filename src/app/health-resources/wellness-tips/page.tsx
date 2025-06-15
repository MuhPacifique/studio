
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, HeartPulse, Lightbulb, Zap, Leaf, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Translation helper
const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda

interface WellnessTip {
  id: string;
  title: string;
  titleKn: string;
  description: string;
  descriptionKn: string;
  icon: React.ElementType;
  category: 'Physical' | 'Mental' | 'Nutrition' | 'Sleep';
  categoryKn: 'Umubiri' | 'Ubwonko' | 'Imirire' | 'Ibitotsi';
}

const mockWellnessTipsData: WellnessTip[] = [
  { id: 'tip1', title: 'Stay Hydrated', titleKn: 'Nywa Amazi Ahagije', description: 'Drink at least 8 glasses of water a day. Proper hydration is crucial for energy levels, brain function, and overall health.', descriptionKn: 'Nywa nibura ibirahuri 8 by\'amazi ku munsi. Kunywa amazi ahagije ni ingenzi ku mbaraga, imikorere y\'ubwonko, n\'ubuzima bwiza muri rusange.', icon: Zap, category: 'Physical', categoryKn: 'Umubiri' },
  { id: 'tip2', title: 'Mindful Moments', titleKn: 'Ibihe byo Kwitekerezaho', description: 'Take 5-10 minutes each day for mindfulness or meditation. It can significantly reduce stress and improve focus.', descriptionKn: 'Fata iminota 5-10 buri munsi yo kwitekerezaho cyangwa gutekereza. Byagabanya cyane stress kandi byongera ubushobozi bwo kwibanda.', icon: Lightbulb, category: 'Mental', categoryKn: 'Ubwonko' },
  { id: 'tip3', title: 'Eat More Greens', titleKn: 'Rya Imboga Nyinshi', description: 'Incorporate a variety of leafy greens and colorful vegetables into your meals for essential vitamins and minerals.', descriptionKn: 'Shyira mu mafunguro yawe ubwoko butandukanye bw\'imboga rwatsi n\'imboga z\'amabara kugirango ubone vitamine n\'imyunyungugu by\'ingenzi.', icon: Leaf, category: 'Nutrition', categoryKn: 'Imirire' },
  { id: 'tip4', title: 'Consistent Sleep Schedule', titleKn: 'Gahunda Ihamye y\'Ibitotsi', description: 'Try to go to bed and wake up around the same time every day, even on weekends, to regulate your body\'s internal clock.', descriptionKn: 'Gerageza kuryama no kubyuka ku masaha asa buri munsi, ndetse no mu mpera z\'icyumweru, kugirango utunganye isaha y\'umubiri wawe.', icon: Moon, category: 'Sleep', categoryKn: 'Ibitotsi' },
  { id: 'tip5', title: 'Regular Movement', titleKn: 'Kunyeganyega Bisanzwe', description: 'Aim for at least 30 minutes of moderate physical activity most days of the week. This could be a brisk walk, cycling, or dancing.', descriptionKn: 'Gerageza gukora imyitozo ngororamubiri yoroheje nibura iminota 30 hafi ya buri munsi mu cyumweru. Ibi bishobora kuba kugenda wihuta, kunyoga igare, cyangwa kubyina.', icon: HeartPulse, category: 'Physical', categoryKn: 'Umubiri'},
  { id: 'tip6', title: 'Limit Processed Foods', titleKn: 'Gabanya Ibiryo Byatunganirijwe', description: 'Reduce your intake of processed foods, sugary drinks, and unhealthy fats. Opt for whole, unprocessed foods whenever possible.', descriptionKn: 'Gabanya kurya ibiryo byatunganirijwe, ibinyobwa birimo isukari nyinshi, n\'ibinure bibi. Hitamo ibiryo byuzuye, bitatunganirijwe igihe cyose bishoboka.', icon: Leaf, category: 'Nutrition', categoryKn: 'Imirire'},
];


export default function WellnessTipsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [wellnessTips, setWellnessTips] = useState<WellnessTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    setIsClient(true);
    // Simulate fetching wellness tips (ephemeral)
    const fetchWellnessTips = async () => {
      setIsLoading(true);
      // Conceptual: const response = await fetch('/api/wellness-tips');
      // Conceptual: const data = await response.json();
      // Conceptual: setWellnessTips(data.tips || []);
      await new Promise(resolve => setTimeout(resolve, 300)); 
      setWellnessTips(mockWellnessTipsData);
      setIsLoading(false);
    };
    fetchWellnessTips();
  }, []);

  if (!isClient || isLoading) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("Daily Wellness Tips", "Inama za Buri Munsi z'Ubuzima Bwiza")} 
            breadcrumbs={[
              {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
              {label: t("Health Resources", "Amakuru y'Ubuzima")}, 
              {label: t("Wellness Tips", "Inama z'Ubuzima Bwiza")}
            ]}
          />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading wellness tips...", "Gutegura inama z'ubuzima bwiza...")}</p>
        </div>
      </AppLayout>
    );
  }
  
  // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }

  const groupedTips = wellnessTips.reduce((acc, tip) => {
    if (!acc[tip.categoryKn]) { 
      acc[tip.categoryKn] = [];
    }
    acc[tip.categoryKn].push(tip);
    return acc;
  }, {} as Record<WellnessTip['categoryKn'], WellnessTip[]>);

  return (
    <AppLayout>
      <PageHeader 
        title={t("Daily Wellness Tips", "Inama za Buri Munsi z'Ubuzima Bwiza")} 
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("Health Resources", "Amakuru y'Ubuzima")}, 
          {label: t("Wellness Tips", "Inama z'Ubuzima Bwiza")}
        ]}
      />
      
      <div className="space-y-6">
        {Object.entries(groupedTips).map(([categoryKn, tips]) => (
          <Card key={categoryKn} className="shadow-lg hover-lift">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center text-primary">
                {tips[0] && <tips[0].icon className="mr-2 h-5 w-5" />} 
                {categoryKn} {t("Wellness", "Ubuzima Bwiza")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {tips.map((tip) => (
                  <AccordionItem value={tip.id} key={tip.id}>
                    <AccordionTrigger className="hover:no-underline group">
                      <div className="flex items-center">
                        <tip.icon className="mr-3 h-5 w-5 text-accent flex-shrink-0 group-hover:animate-pulse" />
                        <span className="font-medium">{tip.titleKn}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8 whitespace-pre-wrap">
                      {tip.descriptionKn}
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
