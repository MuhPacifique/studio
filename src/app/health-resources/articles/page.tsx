
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

interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  aiHint: string;
  category: string;
  readTime: string;
}

const mockArticles: Article[] = [
  { id: 'art1', title: 'Understanding Common Cold vs. Flu', summary: 'Learn the key differences between a common cold and the flu, including symptoms, prevention, and when to see a doctor.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'health infographic comparison', category: 'General Health', readTime: '5 min read' },
  { id: 'art2', title: 'The Importance of a Balanced Diet', summary: 'Discover how a balanced diet contributes to overall health, boosts immunity, and provides essential nutrients for your body.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'healthy food nutrition', category: 'Nutrition', readTime: '7 min read' },
  { id: 'art3', title: 'Tips for Managing Stress Effectively', summary: 'Explore practical strategies for managing stress in daily life, including mindfulness, exercise, and relaxation techniques.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'stress relief yoga', category: 'Mental Wellness', readTime: '6 min read' },
  { id: 'art4', title: 'Benefits of Regular Physical Activity', summary: 'Understand the wide-ranging benefits of incorporating regular physical activity into your routine for physical and mental well-being.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'exercise fitness running', category: 'Fitness', readTime: '8 min read' },
];

export default function EducationalArticlesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
          description: "Please log in to view educational articles.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

  const filteredArticles = mockArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Educational Articles" 
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "Health Resources"}, 
          {label: "Educational Articles"}
        ]}
      >
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search articles by title, category, or keyword..." 
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
              alt={article.title} 
              width={400} 
              height={250} 
              className="w-full h-48 object-cover rounded-t-lg"
              data-ai-hint={article.aiHint} 
            />
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit">{article.category}</Badge>
              <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <p className="text-xs text-muted-foreground">{article.readTime}</p>
              <Button variant="ghost" size="sm" className="text-primary group-hover:underline">
                Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredArticles.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">No articles found matching your search.</p>
        )}
      </div>
    </AppLayout>
  );
}
