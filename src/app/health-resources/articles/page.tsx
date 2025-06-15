
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
const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda

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
  // Conceptual: fullContentUrl: string; 
}

const mockArticlesData: Article[] = [
  { id: 'art1', title: 'Understanding Common Cold vs. Flu', titleKn: 'Kumenya Itandukaniro hagati y\'Ibicurane na Grippe', summary: 'Learn the key differences between a common cold and the flu, including symptoms, prevention, and when to see a doctor.', summaryKn: 'Menya itandukaniro nyamukuru hagati y\'ibicurane bisanzwe na grippe, harimo ibimenyetso, uburyo bwo kwirinda, n\'igihe cyo kujya kwa muganga.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'health infographic comparison', category: 'General Health', categoryKn: 'Ubuzima Rusange', readTime: '5 min read', readTimeKn: 'isomwa mu min 5' },
  { id: 'art2', title: 'The Importance of a Balanced Diet', titleKn: 'Akamaro k\'Indyo Yuzuye', summary: 'Discover how a balanced diet contributes to overall health, boosts immunity, and provides essential nutrients for your body.', summaryKn: 'Menya uburyo indyo yuzuye igira uruhare mu buzima bwiza muri rusange, yongera ubudahangarwa bw\'umubiri, kandi itanga intungamubiri z\'ingenzi ku mubiri wawe.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'healthy food nutrition', category: 'Nutrition', categoryKn: 'Imirire', readTime: '7 min read', readTimeKn: 'isomwa mu min 7' },
  { id: 'art3', title: 'Tips for Managing Stress Effectively', titleKn: 'Inama zo Gucunga Stress mu Buryo Buboneye', summary: 'Explore practical strategies for managing stress in daily life, including mindfulness, exercise, and relaxation techniques.', summaryKn: 'Shakisha ingamba zifatika zo gucunga stress mu buzima bwa buri munsi, harimo kwitegereza, imyitozo ngororamubiri, n\'uburyo bwo kuruhuka.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'stress relief yoga', category: 'Mental Wellness', categoryKn: 'Ubuzima bwo mu Mutwe', readTime: '6 min read', readTimeKn: 'isomwa mu min 6' },
  { id: 'art4', title: 'Benefits of Regular Physical Activity', titleKn: 'Akamaro k\'Imyitozo Ngororamubiri Isanzwe', summary: 'Understand the wide-ranging benefits of incorporating regular physical activity into your routine for physical and mental well-being.', summaryKn: 'Menya akamaro kenshi ko gushyira imyitozo ngororamubiri isanzwe muri gahunda yawe ku buzima bwiza bw\'umubiri n\'ubwo mu mutwe.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'exercise fitness running', category: 'Fitness', categoryKn: 'Imyitozo Ngororamubiri', readTime: '8 min read', readTimeKn: 'isomwa mu min 8' },
];

export default function EducationalArticlesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Conceptual auth state; AppLayout manages actual auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching articles (ephemeral)
    const fetchArticles = async () => {
      setIsLoading(true);
      // Conceptual: const response = await fetch('/api/articles');
      // Conceptual: const data = await response.json();
      // Conceptual: setArticles(data.articles || []);
      await new Promise(resolve => setTimeout(resolve, 300)); 
      setArticles(mockArticlesData);
      setIsLoading(false);
    };
    fetchArticles();
  }, []);


  const filteredArticles = articles.filter(article =>
    article.titleKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.categoryKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summaryKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReadMore = (articleId: string, articleTitle: string) => {
    // In a real app, this would navigate to a dynamic route like `/health-resources/articles/${articleId}`
    toast({
      title: t("Kujya ku Nyandiko (Igerageza)", "Kujya ku Nyandiko (Igerageza)"),
      description: t(`Ubu wajyanwa ku nyandiko yuzuye ya "${articleTitle}". Ibi bisaba inzira yihariye n'isesengura ry'inyandiko yuzuye. Amakuru ntazabikwa muri iyi prototype.`, `Ubu wajyanwa ku nyandiko yuzuye ya "${articleTitle}". Ibi bisaba inzira yihariye n'isesengura ry'inyandiko yuzuye. Amakuru ntazabikwa muri iyi prototype.`),
    });
    // router.push(`/health-resources/articles/${articleId}`); // Conceptual navigation, real page not implemented
  };

  if (!isClient || isLoading) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("Educational Articles", "Inyandiko Zigisha")} 
            breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Health Resources", "Amakuru y'Ubuzima")}, 
            {label: t("Educational Articles", "Inyandiko Zigisha")}
            ]}
         />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading articles...", "Gutegura inyandiko...")}</p>
        </div>
      </AppLayout>
    );
  }
  
  // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }


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
              alt={article.titleKn} 
              width={400} 
              height={250} 
              className="w-full h-48 object-cover rounded-t-lg"
              data-ai-hint={article.aiHint} 
            />
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit">{article.categoryKn}</Badge>
              <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{article.titleKn}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3">{article.summaryKn}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <p className="text-xs text-muted-foreground">{article.readTimeKn}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary group-hover:underline transition-transform hover:scale-105 active:scale-95"
                onClick={() => handleReadMore(article.id, article.titleKn)}
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
