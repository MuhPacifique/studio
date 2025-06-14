
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, BookOpen, Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Translation helper
const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

interface Article {
  id: string;
  title: string;
  titleKn: string;
  summary: string;
  summaryKn: string;
  imageUrl: string;
  aiHint: string;
  category: string;
  categoryKn: string;
  readTime: string;
  readTimeKn: string;
}

const mockArticles: Article[] = [
  { id: 'art1', title: 'Understanding Common Cold vs. Flu', titleKn: 'Kumenya Itandukaniro hagati y\'Ibicurane na Grippe', summary: 'Learn the key differences between a common cold and the flu, including symptoms, prevention, and when to see a doctor.', summaryKn: 'Menya itandukaniro nyamukuru hagati y\'ibicurane bisanzwe na grippe, harimo ibimenyetso, uburyo bwo kwirinda, n\'igihe cyo kujya kwa muganga.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'health infographic comparison', category: 'General Health', categoryKn: 'Ubuzima Rusange', readTime: '5 min read', readTimeKn: 'isomwa mu min 5' },
  { id: 'art2', title: 'The Importance of a Balanced Diet', titleKn: 'Akamaro k\'Indyo Yuzuye', summary: 'Discover how a balanced diet contributes to overall health, boosts immunity, and provides essential nutrients for your body.', summaryKn: 'Menya uburyo indyo yuzuye igira uruhare mu buzima bwiza muri rusange, yongera ubudahangarwa bw\'umubiri, kandi itanga intungamubiri z\'ingenzi ku mubiri wawe.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'healthy food nutrition', category: 'Nutrition', categoryKn: 'Imirire', readTime: '7 min read', readTimeKn: 'isomwa mu min 7' },
  { id: 'art3', title: 'Tips for Managing Stress Effectively', titleKn: 'Inama zo Gucunga Stress mu Buryo Buboneye', summary: 'Explore practical strategies for managing stress in daily life, including mindfulness, exercise, and relaxation techniques.', summaryKn: 'Shakisha ingamba zifatika zo gucunga stress mu buzima bwa buri munsi, harimo kwitegereza, imyitozo ngororamubiri, n\'uburyo bwo kuruhuka.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'stress relief yoga', category: 'Mental Wellness', categoryKn: 'Ubuzima bwo mu Mutwe', readTime: '6 min read', readTimeKn: 'isomwa mu min 6' },
  { id: 'art4', title: 'Benefits of Regular Physical Activity', titleKn: 'Akamaro k\'Imyitozo Ngororamubiri Isanzwe', summary: 'Understand the wide-ranging benefits of incorporating regular physical activity into your routine for physical and mental well-being.', summaryKn: 'Menya akamaro kenshi ko gushyira imyitozo ngororamubiri isanzwe muri gahunda yawe ku buzima bwiza bw\'umubiri n\'ubwo mu mutwe.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'exercise fitness running', category: 'Fitness', categoryKn: 'Imyitozo Ngororamubiri', readTime: '8 min read', readTimeKn: 'isomwa mu min 8' },
];

export default function EducationalArticlesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe"),
          description: t("Please log in to view educational articles.", "Nyamuneka injira kugirango ubashe kureba inyandiko zigisha."),
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast, currentLanguage]);

  const filteredArticles = mockArticles.filter(article =>
    (currentLanguage === 'kn' ? article.titleKn : article.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (currentLanguage === 'kn' ? article.categoryKn : article.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (currentLanguage === 'kn' ? article.summaryKn : article.summary).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReadMore = (articleTitle: string) => {
    toast({
      title: t("Navigating to Article (Mock)", "Kujya ku Nyandiko (Agateganyo)"),
      description: t(`You would now be taken to the full article for "${articleTitle}".`, `Ubu wajyanwa ku nyandiko yuzuye ya "${articleTitle}".`),
    });
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading articles...", "Gutegura inyandiko...")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title={t("Educational Articles", "Inyandiko Zigisha")} 
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("Health Resources", "Amakuru y'Ubuzima")}, 
          {label: t("Educational Articles", "Inyandiko Zigisha")}
        ]}
      >
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={t("Search articles by title, category, or keyword...", "Shakisha inyandiko ukoresheje umutwe, icyiciro, cyangwa ijambofatizo...")} 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <Card key={article.id} className="flex flex-col shadow-lg hover-lift group">
            <Image 
              src={article.imageUrl} 
              alt={t(article.title, article.titleKn)} 
              width={400} 
              height={250} 
              className="w-full h-48 object-cover rounded-t-lg"
              data-ai-hint={article.aiHint} 
            />
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit">{t(article.category, article.categoryKn)}</Badge>
              <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{t(article.title, article.titleKn)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3">{t(article.summary, article.summaryKn)}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <p className="text-xs text-muted-foreground">{t(article.readTime, article.readTimeKn)}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary group-hover:underline transition-transform hover:scale-105 active:scale-95"
                onClick={() => handleReadMore(t(article.title, article.titleKn))}
              >
                {t("Read More", "Soma Byinshi")} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredArticles.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">{t("No articles found matching your search.", "Nta nyandiko zihuye n'ubushakashatsi bwawe zabonetse.")}</p>
        )}
      </div>
    </AppLayout>
  );
}
