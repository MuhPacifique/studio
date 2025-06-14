
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

// Re-using the mock data structure and a subset of data for demonstration
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

const mockForumPosts: ForumPost[] = [
  { id: 'fp1', title: 'Managing chronic pain - tips and support', author: 'Alice W.', authorAvatar: 'https://placehold.co/40x40.png?text=AW', authorInitials: 'AW', category: 'Pain Management', timestamp: '2 days ago', summary: 'Looking for advice and shared experiences on managing long-term chronic pain. What has worked for you?', fullContent: "Detailed content about managing chronic pain goes here. This includes personal anecdotes, medical advice gathered (with disclaimers), and questions for the community. It could span multiple paragraphs and include lists:\n\n*   Mindfulness techniques\n*   Gentle exercises\n*   Dietary considerations\n\nPlease share what has helped you!", likes: 15, commentsCount: 4, aiHint: 'community support people', tags: ['chronic pain', 'support', 'wellness'] },
  { id: 'fp2', title: 'Dealing with anxiety before medical tests', author: 'Bob K.', authorAvatar: 'https://placehold.co/40x40.png?text=BK', authorInitials: 'BK', category: 'Mental Wellness', timestamp: '5 hours ago', summary: 'I always get very anxious before any medical test or procedure. How do others cope with this?', fullContent: "In-depth discussion about medical test anxiety, coping mechanisms, breathing exercises, and seeking professional help when needed. It's important to remember you're not alone in this.", likes: 22, commentsCount: 8, aiHint: 'anxious person thinking', tags: ['anxiety', 'medical tests', 'mental health'] },
  { id: 'fp3', title: 'Healthy recipes for a low-sodium diet?', author: 'Carlos G.', authorAvatar: 'https://placehold.co/40x40.png?text=CG', authorInitials: 'CG', category: 'Nutrition', timestamp: '1 week ago', summary: 'Doctor recommended a low-sodium diet. Sharing and looking for tasty recipe ideas!', fullContent: "Collection of low-sodium recipes, tips for flavoring food without salt (herbs, spices, citrus), and links to useful resources. Let's compile a great list together!", likes: 30, commentsCount: 12, aiHint: 'healthy cooking vegetables', tags: ['nutrition', 'low-sodium', 'recipes', 'diet'] },
];

const mockComments: { [postId: string]: Comment[] } = {
  fp1: [
    { id: 'c1', author: 'Eva S.', authorAvatar: 'https://placehold.co/40x40.png?text=ES', authorInitials: 'ES', timestamp: '1 day ago', text: 'Great post! I find gentle yoga very helpful for my chronic back pain.' },
    { id: 'c2', author: 'David L.', authorAvatar: 'https://placehold.co/40x40.png?text=DL', authorInitials: 'DL', timestamp: '18 hours ago', text: 'Has anyone tried acupuncture? Curious about its effectiveness.' },
  ],
  fp2: [
    { id: 'c3', author: 'Sarah P.', authorAvatar: 'https://placehold.co/40x40.png?text=SP', authorInitials: 'SP', timestamp: '3 hours ago', text: 'Deep breathing exercises and listening to calming music help me a lot.' },
  ],
  fp3: [],
};


export default function ForumPostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const postId = params.postId as string;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({ variant: "destructive", title: "Access Denied", description: "Please log in to view forum posts." });
        router.replace('/welcome');
        return;
      }
      setIsAuthenticated(true);
      
      const foundPost = mockForumPosts.find(p => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
        setComments(mockComments[postId] || []);
      } else {
        toast({ variant: "destructive", title: "Post not found" });
        router.push('/community-support/forums');
      }
    }
  }, [isClient, router, toast, postId]);

  const handleLikePost = () => {
    if (post) {
      setPost({ ...post, likes: post.likes + 1 });
      toast({ title: "Post Liked (Mock)" });
    }
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
        toast({variant: "destructive", title: "Cannot submit empty comment"});
        return;
    }
    setIsSubmittingComment(true);
    // Mock comment submission
    setTimeout(() => {
      const commentToAdd: Comment = {
        id: `c${Date.now()}`,
        author: localStorage.getItem('mockUserName') || 'You', // Mock author
        authorAvatar: 'https://placehold.co/40x40.png?text=U',
        authorInitials: (localStorage.getItem('mockUserName') || 'U').substring(0,2).toUpperCase(),
        timestamp: 'Just now',
        text: newComment,
      };
      setComments(prev => [...prev, commentToAdd]);
      if(post) setPost({...post, commentsCount: post.commentsCount + 1});
      setNewComment('');
      setIsSubmittingComment(false);
      toast({ title: "Comment Added (Mock)" });
    }, 1000);
  };


  if (!isClient || !isAuthenticated || !post) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading post details...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title={post.title}
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "Community & Support", href: "/community-support/forums"}, 
          {label: "Patient Forums", href: "/community-support/forums"},
          {label: post.title.substring(0,30) + "..."}
        ]}
      />

      <Card className="shadow-xl hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="font-headline text-2xl text-primary">{post.title}</CardTitle>
            <Badge variant="outline">{post.category}</Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint={post.aiHint} />
              <AvatarFallback>{post.authorInitials}</AvatarFallback>
            </Avatar>
            <span>Posted by <span className="font-medium text-foreground">{post.author}</span></span>
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
            <ThumbsUp className="mr-1.5 h-4 w-4"/> {post.likes} Likes
          </Button>
           <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="mr-1.5 h-4 w-4"/> {post.commentsCount} Comments
            </div>
        </CardFooter>
      </Card>

      <Separator className="my-8" />

      <Card id="comments" className="shadow-lg hover-lift">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary"/> Comments ({comments.length})
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
            <p className="text-muted-foreground">No comments yet. Be the first to reply!</p>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <form onSubmit={handleAddComment} className="w-full space-y-3">
            <div>
              <label htmlFor="newComment" className="block text-sm font-medium text-foreground mb-1">
                Leave a Reply
              </label>
              <Textarea
                id="newComment"
                placeholder="Write your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button type="submit" className="transition-transform hover:scale-105 active:scale-95" disabled={isSubmittingComment}>
              {isSubmittingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
              {isSubmittingComment ? 'Submitting...' : 'Post Comment'}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </AppLayout>
  );
}
