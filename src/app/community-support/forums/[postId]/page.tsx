
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, ThumbsUp, UserCircle, CalendarDays, Send } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  authorInitials: string;
  category: string;
  timestamp: string;
  summary: string;
  fullContent: string; 
  likes: number;
  commentsCount: number;
  aiHint: string;
  tags?: string[];
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  authorInitials: string;
  timestamp: string;
  text: string;
}

// Default mock data, will not persist after page reload.
const defaultForumPosts: ForumPost[] = [
  { id: 'fp1', title: 'Managing chronic pain - tips and support', author: 'Alice W.', authorAvatar: 'https://placehold.co/40x40.png?text=AW', authorInitials: 'AW', category: 'Pain Management', timestamp: '2 days ago', summary: 'Looking for advice and shared experiences on managing long-term chronic pain. What has worked for you?', fullContent: "Detailed content about managing chronic pain goes here. This includes personal anecdotes, medical advice gathered (with disclaimers), and questions for the community. It could span multiple paragraphs and include lists:\n\n*   Mindfulness techniques\n*   Gentle exercises\n*   Dietary considerations\n\nPlease share what has helped you!", likes: 15, commentsCount: 4, aiHint: 'community support people', tags: ['chronic pain', 'support', 'wellness'] },
  { id: 'fp2', title: 'Dealing with anxiety before medical tests', author: 'Bob K.', authorAvatar: 'https://placehold.co/40x40.png?text=BK', authorInitials: 'BK', category: 'Mental Wellness', timestamp: '5 hours ago', summary: 'I always get very anxious before any medical test or procedure. How do others cope with this?', fullContent: "In-depth discussion about medical test anxiety, coping mechanisms, breathing exercises, and seeking professional help when needed. It's important to remember you're not alone in this.", likes: 22, commentsCount: 8, aiHint: 'anxious person thinking', tags: ['anxiety', 'medical tests', 'mental health'] },
];

const defaultComments: { [postId: string]: Comment[] } = {
  fp1: [
    { id: 'c1', author: 'Eva S.', authorAvatar: 'https://placehold.co/40x40.png?text=ES', authorInitials: 'ES', timestamp: '1 day ago', text: 'Great post! I find gentle yoga very helpful for my chronic back pain.' },
    { id: 'c2', author: 'David L.', authorAvatar: 'https://placehold.co/40x40.png?text=DL', authorInitials: 'DL', timestamp: '18 hours ago', text: 'Has anyone tried acupuncture? Curious about its effectiveness.' },
  ],
  fp2: [
    { id: 'c3', author: 'Sarah P.', authorAvatar: 'https://placehold.co/40x40.png?text=SP', authorInitials: 'SP', timestamp: '3 hours ago', text: 'Deep breathing exercises and listening to calming music help me a lot.' },
  ],
};

const forumCategories = ['Pain Management', 'Mental Wellness', 'Nutrition', 'Fitness', 'General Health', 'Other'];
const forumCategoriesKn = ['Gucunga Ububabare', 'Ubuzima Bwo Mu Mutwe', 'Imirire', 'Imyitozo Ngororamubiri', 'Ubuzima Rusange', 'Ibindi'];

const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

const PostDetailSkeleton = () => (
    <>
    <Card className="shadow-xl">
        <CardHeader>
            <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center space-x-2 text-sm">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="flex flex-wrap gap-1 pt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-full" />
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-start space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
        </CardFooter>
    </Card>
    <Separator className="my-8" />
    <Card id="comments" className="shadow-lg">
        <CardHeader>
            <Skeleton className="h-7 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-6">
            {[1,2].map(i => (
                 <div key={i} className="flex space-x-3 p-3 bg-muted/30 dark:bg-muted/10 rounded-lg shadow-sm">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/5" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            ))}
        </CardContent>
        <CardFooter className="border-t pt-6">
             <div className="w-full space-y-3">
                <Skeleton className="h-4 w-1/4 mb-1"/>
                <Skeleton className="h-20 w-full"/>
                <Skeleton className="h-10 w-32"/>
             </div>
        </CardFooter>
    </Card>
    </>
);


export default function ForumPostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  const [isClient, setIsClient] = useState(false);
  // Assume not authenticated until backend confirms.
  // AppLayout will handle redirection if this page is accessed without auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [post, setPost] = useState<ForumPost | null>(null); // Post details are ephemeral
  const [comments, setComments] = useState<Comment[]>([]); // Comments are ephemeral
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const postId = params.postId as string;

  useEffect(() => {
    setIsClient(true);
    setCurrentLanguage('kn'); // Default to Kinyarwanda as localStorage is removed
  }, []);

  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  useEffect(() => {
    if (isClient) {
      // Simulate fetching post and comments. No localStorage means data resets on reload.
      const foundPost = defaultForumPosts.find(p => p.id === postId);

      if (foundPost) {
        setPost(foundPost);
        setComments(defaultComments[postId] || []);
      } else {
        toast({ variant: "destructive", title: t("Post not found", "Inkuru ntiyabonetse") });
        router.push('/community-support/forums');
      }
      setIsLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, router, toast, postId, currentLanguage]);

  const handleLikePost = () => {
    if (post) {
      // UI update is ephemeral
      const updatedPost = { ...post, likes: post.likes + 1 };
      setPost(updatedPost);
      toast({ title: t("Post Liked (Mock)", "Inkuru Yakunzwe (By'agateganyo)") });
    }
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
        toast({variant: "destructive", title: t("Cannot submit empty comment", "Ntushobora kohereza igitecyerezo kirimo ubusa")});
        return;
    }
    setIsSubmittingComment(true);
    
    const commentToAdd: Comment = {
      id: `c${Date.now()}`,
      author: t('Current User (Mock)', 'Ukoresha (By\'agateganyo)'),
      authorAvatar: 'https://placehold.co/40x40.png?text=U',
      authorInitials: "U",
      timestamp: t('Just now', 'Nonaha'),
      text: newComment,
    };

    // UI update is ephemeral
    const updatedComments = [...comments, commentToAdd];
    setComments(updatedComments);

    if(post) {
      const updatedPost = {...post, commentsCount: post.commentsCount + 1};
      setPost(updatedPost);
    }
    
    setNewComment('');
    setIsSubmittingComment(false);
    toast({ title: t("Comment Added (Mock)", "Igitecyerezo Cyongeweho (By'agateganyo)"), description: t("Your comment has been added. It will not persist after page reload.", "Igitecyerezo cyawe cyongeweho. Nticyizabikwa nyuma yo guhindura paji.") });
  };


  if (!isClient || isLoadingData || !post) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("Loading Post...", "Gutegura Inkuru...")}
            breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/forums"}, 
            {label: t("Patient Forums", "Ibiganiro by'Abarwayi"), href: "/community-support/forums"},
            {label: t("Loading...", "Gutegura...")}
            ]}
         />
        <PostDetailSkeleton/>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title={post.title}
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/forums"}, 
          {label: t("Patient Forums", "Ibiganiro by'Abarwayi"), href: "/community-support/forums"},
          {label: post.title.substring(0,30) + "..."}
        ]}
      />

      <Card className="shadow-xl hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="font-headline text-2xl text-primary">{post.title}</CardTitle>
            <Badge variant="outline">{currentLanguage === 'kn' ? forumCategoriesKn[forumCategories.indexOf(post.category)] || post.category : post.category}</Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint={post.aiHint} />
              <AvatarFallback>{post.authorInitials}</AvatarFallback>
            </Avatar>
            <span>{t('Posted by', 'Byanditswe na')} <span className="font-medium text-foreground">{post.author}</span></span>
            <span>•</span>
            <CalendarDays className="h-4 w-4" />
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
        <CardContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
          {post.fullContent}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-start space-x-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={handleLikePost}>
            <ThumbsUp className="mr-1.5 h-4 w-4"/> {post.likes} {t("Likes", "Abakunze")}
          </Button>
           <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="mr-1.5 h-4 w-4"/> {post.commentsCount} {t("Comments", "Ibitecyerezo")}
            </div>
        </CardFooter>
      </Card>

      <Separator className="my-8" />

      <Card id="comments" className="shadow-lg hover-lift">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary"/> {t("Comments", "Ibitecyerezo")} ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="flex space-x-3 p-3 bg-muted/30 dark:bg-muted/10 rounded-lg shadow-sm">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.authorAvatar} alt={comment.author} data-ai-hint="user avatar" />
                  <AvatarFallback>{comment.authorInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-foreground">{comment.author}</p>
                    <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                  </div>
                  <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">{t("No comments yet. Be the first to reply!", "Nta bitecyerezo birahaba. Ba uwa mbere mu gusubiza!")}</p>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <form onSubmit={handleAddComment} className="w-full space-y-3">
            <div>
              <Label htmlFor="newComment" className="block text-sm font-medium text-foreground mb-1">
                {t("Leave a Reply", "Siga Igitecyerezo")}
              </Label>
              <Textarea
                id="newComment"
                placeholder={t("Write your comment here...", "Andika igitecyerezo cyawe hano...")}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button type="submit" className="transition-transform hover:scale-105 active:scale-95" disabled={isSubmittingComment}>
              {isSubmittingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
              {isSubmittingComment ? t('Submitting...', 'Kohereza...') : t('Post Comment', 'Ohereza Igitecyerezo')}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </AppLayout>
  );
}
```