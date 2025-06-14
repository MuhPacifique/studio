
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquareQuote, Search, PlusCircle, ThumbsUp, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  authorInitials: string;
  category: string;
  timestamp: string;
  summary: string;
  likes: number;
  comments: number;
  aiHint: string;
}

const mockForumPosts: ForumPost[] = [
  { id: 'fp1', title: 'Managing chronic pain - tips and support', author: 'Alice W.', authorAvatar: 'https://placehold.co/40x40.png?text=AW', authorInitials: 'AW', category: 'Pain Management', timestamp: '2 days ago', summary: 'Looking for advice and shared experiences on managing long-term chronic pain. What has worked for you?', likes: 15, comments: 4, aiHint: 'community support people' },
  { id: 'fp2', title: 'Dealing with anxiety before medical tests', author: 'Bob K.', authorAvatar: 'https://placehold.co/40x40.png?text=BK', authorInitials: 'BK', category: 'Mental Wellness', timestamp: '5 hours ago', summary: 'I always get very anxious before any medical test or procedure. How do others cope with this?', likes: 22, comments: 8, aiHint: 'anxious person thinking' },
  { id: 'fp3', title: 'Healthy recipes for a low-sodium diet?', author: 'Carlos G.', authorAvatar: 'https://placehold.co/40x40.png?text=CG', authorInitials: 'CG', category: 'Nutrition', timestamp: '1 week ago', summary: 'Doctor recommended a low-sodium diet. Sharing and looking for tasty recipe ideas!', likes: 30, comments: 12, aiHint: 'healthy cooking vegetables' },
];

export default function PatientForumsPage() {
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
          description: "Please log in to access patient forums.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);

  const filteredPosts = mockForumPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Patient Forums...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Patient Forums" 
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "Community & Support"}, 
          {label: "Patient Forums"}
        ]}
      >
        <div className="flex items-center space-x-2">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                placeholder="Search forums..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button className="transition-transform hover:scale-105 active:scale-95">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
            </Button>
        </div>
      </PageHeader>
      
      <Card className="mb-6 shadow-lg bg-primary/5 hover-lift">
        <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center">
                <MessageSquareQuote className="mr-2 h-6 w-6"/> Welcome to the Forums!
            </CardTitle>
            <CardDescription>
                Connect with other patients, share experiences, and find support. Please remember to be respectful and that this is not a substitute for professional medical advice.
            </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {filteredPosts.map(post => (
          <Card key={post.id} className="shadow-lg hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-xl hover:text-primary transition-colors cursor-pointer">{post.title}</CardTitle>
                <Badge variant="outline">{post.category}</Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint={post.aiHint}/>
                  <AvatarFallback>{post.authorInitials}</AvatarFallback>
                </Avatar>
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">{post.summary}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-3">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <ThumbsUp className="mr-1.5 h-4 w-4"/> {post.likes} Likes
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <MessageSquare className="mr-1.5 h-4 w-4"/> {post.comments} Comments
                </Button>
              </div>
              <Button variant="outline" size="sm" className="transition-transform hover:scale-105 active:scale-95">Read More & Reply</Button>
            </CardFooter>
          </Card>
        ))}
        {filteredPosts.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">No forum posts found matching your search.</p>
        )}
      </div>
    </AppLayout>
  );
}
