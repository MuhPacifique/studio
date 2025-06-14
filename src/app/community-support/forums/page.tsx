
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquareQuote, Search, PlusCircle, ThumbsUp, MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  authorInitials: string;
  category: string;
  timestamp: string;
  summary: string;
  fullContent?: string; // Added for detail page
  likes: number;
  commentsCount: number; // Renamed for clarity
  aiHint: string;
  tags?: string[];
}

const initialMockForumPosts: ForumPost[] = [
  { id: 'fp1', title: 'Managing chronic pain - tips and support', author: 'Alice W.', authorAvatar: 'https://placehold.co/40x40.png?text=AW', authorInitials: 'AW', category: 'Pain Management', timestamp: '2 days ago', summary: 'Looking for advice and shared experiences on managing long-term chronic pain. What has worked for you?', fullContent: "Detailed content about managing chronic pain goes here. This includes personal anecdotes, medical advice gathered (with disclaimers), and questions for the community. It could span multiple paragraphs...", likes: 15, commentsCount: 4, aiHint: 'community support people', tags: ['chronic pain', 'support', 'wellness'] },
  { id: 'fp2', title: 'Dealing with anxiety before medical tests', author: 'Bob K.', authorAvatar: 'https://placehold.co/40x40.png?text=BK', authorInitials: 'BK', category: 'Mental Wellness', timestamp: '5 hours ago', summary: 'I always get very anxious before any medical test or procedure. How do others cope with this?', fullContent: "In-depth discussion about medical test anxiety, coping mechanisms, breathing exercises, and seeking professional help when needed.", likes: 22, commentsCount: 8, aiHint: 'anxious person thinking', tags: ['anxiety', 'medical tests', 'mental health'] },
  { id: 'fp3', title: 'Healthy recipes for a low-sodium diet?', author: 'Carlos G.', authorAvatar: 'https://placehold.co/40x40.png?text=CG', authorInitials: 'CG', category: 'Nutrition', timestamp: '1 week ago', summary: 'Doctor recommended a low-sodium diet. Sharing and looking for tasty recipe ideas!', fullContent: "Collection of low-sodium recipes, tips for flavoring food without salt, and links to useful resources.", likes: 30, commentsCount: 12, aiHint: 'healthy cooking vegetables', tags: ['nutrition', 'low-sodium', 'recipes', 'diet'] },
];

export default function PatientForumsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>(initialMockForumPosts);

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

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, likes: post.likes + 1 } : post));
    toast({ title: "Post Liked (Mock)" });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
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
                placeholder="Search forums by title, category, tag..." 
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
          <Card key={post.id} className="shadow-lg hover-lift group transition-all duration-300 ease-in-out hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Link href={`/community-support/forums/${post.id}`} className="block">
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors cursor-pointer">{post.title}</CardTitle>
                </Link>
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
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                    {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">{post.summary}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-3">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => handleLike(post.id)}>
                    <ThumbsUp className="mr-1.5 h-4 w-4"/> {post.likes} Likes
                </Button>
                <Link href={`/community-support/forums/${post.id}#comments`} className="inline-flex items-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <MessageSquare className="mr-1.5 h-4 w-4"/> {post.commentsCount} Comments
                    </Button>
                </Link>
              </div>
              <Link href={`/community-support/forums/${post.id}`}>
                <Button variant="outline" size="sm" className="transition-transform group-hover:scale-105 active:scale-95 hover:bg-primary/10 hover:border-primary">
                  Read More & Reply <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {filteredPosts.length === 0 && (
            <Card className="shadow-md">
                <CardContent className="py-10 text-center">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No forum posts found matching your search criteria.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}

