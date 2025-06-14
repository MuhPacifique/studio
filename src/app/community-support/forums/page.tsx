
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  fullContent?: string;
  likes: number;
  commentsCount: number;
  aiHint: string;
  tags?: string[];
}

const defaultForumPosts: ForumPost[] = [
  { id: 'fp1', title: 'Managing chronic pain - tips and support', author: 'Alice W.', authorAvatar: 'https://placehold.co/40x40.png?text=AW', authorInitials: 'AW', category: 'Pain Management', timestamp: '2 days ago', summary: 'Looking for advice and shared experiences on managing long-term chronic pain. What has worked for you?', fullContent: "Detailed content about managing chronic pain goes here. This includes personal anecdotes, medical advice gathered (with disclaimers), and questions for the community. It could span multiple paragraphs...", likes: 15, commentsCount: 4, aiHint: 'community support people', tags: ['chronic pain', 'support', 'wellness'] },
  { id: 'fp2', title: 'Dealing with anxiety before medical tests', author: 'Bob K.', authorAvatar: 'https://placehold.co/40x40.png?text=BK', authorInitials: 'BK', category: 'Mental Wellness', timestamp: '5 hours ago', summary: 'I always get very anxious before any medical test or procedure. How do others cope with this?', fullContent: "In-depth discussion about medical test anxiety, coping mechanisms, breathing exercises, and seeking professional help when needed.", likes: 22, commentsCount: 8, aiHint: 'anxious person thinking', tags: ['anxiety', 'medical tests', 'mental health'] },
  { id: 'fp3', title: 'Healthy recipes for a low-sodium diet?', author: 'Carlos G.', authorAvatar: 'https://placehold.co/40x40.png?text=CG', authorInitials: 'CG', category: 'Nutrition', timestamp: '1 week ago', summary: 'Doctor recommended a low-sodium diet. Sharing and looking for tasty recipe ideas!', fullContent: "Collection of low-sodium recipes, tips for flavoring food without salt, and links to useful resources.", likes: 30, commentsCount: 12, aiHint: 'healthy cooking vegetables', tags: ['nutrition', 'low-sodium', 'recipes', 'diet'] },
];

const forumCategories = ['Pain Management', 'Mental Wellness', 'Nutrition', 'Fitness', 'General Health', 'Other'];
const forumCategoriesKn = ['Gucunga Ububabare', 'Ubuzima Bwo Mu Mutwe', 'Imirire', 'Imyitozo Ngororamubiri', 'Ubuzima Rusange', 'Ibindi'];


// Translation helper
const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

const ForumPostSkeleton = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex items-center space-x-2 pt-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex flex-wrap gap-1 pt-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <CardFooter className="flex justify-between items-center border-t pt-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-9 w-32" />
    </CardFooter>
  </Card>
);

export default function PatientForumsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);
  
  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe"),
          description: t("Please log in to access patient forums.", "Nyamuneka injira kugirango ubashe kugera ku biganiro by'abarwayi."),
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
        const savedPosts = localStorage.getItem('forumPosts');
        setPosts(savedPosts ? JSON.parse(savedPosts) : defaultForumPosts);
      }
      setIsLoadingData(false);
    }
  }, [isClient, router, toast, currentLanguage]);

  useEffect(() => {
    if (isClient && posts.length > 0) { // Only save if posts have been initialized
      localStorage.setItem('forumPosts', JSON.stringify(posts));
    }
  }, [posts, isClient]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
    toast({ title: t("Post Liked", "Inkuru Yakunzwe") });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostCategory.trim() || !newPostContent.trim()) {
      toast({ variant: "destructive", title: t("Missing Information", "Amakuru Arabura"), description: t("Please fill in title, category, and content.", "Nyamuneka uzuza umutwe, icyiciro, n'ibiri muri yo.")});
      return;
    }
    const newPost: ForumPost = {
      id: `fp${Date.now()}`,
      title: newPostTitle,
      category: newPostCategory,
      summary: newPostContent.substring(0, 100) + (newPostContent.length > 100 ? "..." : ""),
      fullContent: newPostContent,
      author: localStorage.getItem('mockUserName') || t('Anonymous User', 'Ukoresha utazwi'),
      authorAvatar: 'https://placehold.co/40x40.png?text=U',
      authorInitials: (localStorage.getItem('mockUserName') || "U").substring(0,2).toUpperCase(),
      timestamp: t('Just now', 'Nonaha'),
      likes: 0,
      commentsCount: 0,
      aiHint: 'user generated content',
      tags: newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
    toast({ title: t("Post Created", "Inkuru Yashyizweho") });
    setIsCreatePostOpen(false);
    setNewPostTitle('');
    setNewPostCategory('');
    setNewPostContent('');
    setNewPostTags('');
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  ).sort((a,b) => (a.timestamp === t('Just now', 'Nonaha') ? -1 : b.timestamp === t('Just now', 'Nonaha') ? 1 : 0) || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by timestamp, "Just now" first


  if (!isClient || isLoadingData) {
    return (
      <AppLayout>
        <PageHeader 
            title={t("Patient Forums", "Ibiganiro by'Abarwayi")}
            breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/forums"}, 
            {label: t("Patient Forums", "Ibiganiro by'Abarwayi")}
            ]}
        >
             <div className="flex items-center space-x-2">
                 <Skeleton className="h-10 w-full max-w-md"/>
                 <Skeleton className="h-10 w-36"/>
            </div>
        </PageHeader>
        <Card className="mb-6 shadow-lg">
             <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2"/>
                <Skeleton className="h-4 w-3/4"/>
                <Skeleton className="h-4 w-2/3 mt-1"/>
            </CardHeader>
        </Card>
        <div className="space-y-6">
            <ForumPostSkeleton />
            <ForumPostSkeleton />
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <PageHeader 
        title={t("Patient Forums", "Ibiganiro by'Abarwayi")}
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/forums"}, 
          {label: t("Patient Forums", "Ibiganiro by'Abarwayi")}
        ]}
      >
        <div className="flex items-center space-x-2">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                placeholder={t("Search forums by title, category, tag...", "Shakisha mu biganiro ukoresheje umutwe, icyiciro, ijambofatizo...")} 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={() => setIsCreatePostOpen(true)} className="transition-transform hover:scale-105 active:scale-95">
                <PlusCircle className="mr-2 h-4 w-4" /> {t("Create New Post", "Andika Inkuru Nshya")}
            </Button>
        </div>
      </PageHeader>
      
      <Card className="mb-6 shadow-lg bg-primary/5 hover-lift dark:bg-primary/10">
        <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center">
                <MessageSquareQuote className="mr-2 h-6 w-6"/> {t("Welcome to the Forums!", "Murakaza neza mu Biganiro!")}
            </CardTitle>
            <CardDescription>
                {t("Connect with other patients, share experiences, and find support. Please remember to be respectful and that this is not a substitute for professional medical advice.", "Hura n'abandi barwayi, sangira uburambe, kandi ubone ubufasha. Nyamuneka wibuke kubaha abandi kandi uzirikane ko ibi bidashobora gusimbura inama za muganga w'umwuga.")}
            </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {filteredPosts.map(post => (
          <Card key={post.id} className="shadow-lg hover-lift group transition-all duration-300 ease-in-out hover:border-primary/50 dark:border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Link href={`/community-support/forums/${post.id}`} className="block">
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors cursor-pointer">{post.title}</CardTitle>
                </Link>
                <Badge variant="outline">{currentLanguage === 'kn' ? forumCategoriesKn[forumCategories.indexOf(post.category)] || post.category : post.category}</Badge>
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
                    <ThumbsUp className="mr-1.5 h-4 w-4"/> {post.likes} {t("Likes", "Abakunze")}
                </Button>
                <Link href={`/community-support/forums/${post.id}#comments`} className="inline-flex items-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <MessageSquare className="mr-1.5 h-4 w-4"/> {post.commentsCount} {t("Comments", "Ibitecyerezo")}
                    </Button>
                </Link>
              </div>
              <Link href={`/community-support/forums/${post.id}`}>
                <Button variant="outline" size="sm" className="transition-transform group-hover:scale-105 active:scale-95 hover:bg-primary/10 hover:border-primary">
                  {t("Read More & Reply", "Soma Byinshi & Subiza")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {filteredPosts.length === 0 && !isLoadingData && (
            <Card className="shadow-md">
                <CardContent className="py-10 text-center">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("No forum posts found matching your search criteria.", "Nta nkuru zo mu biganiro zihuye n'ibyo washakishije zabonetse.")}</p>
                </CardContent>
            </Card>
        )}
      </div>
      
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("Create New Forum Post", "Andika Inkuru Nshya mu Biganiro")}</DialogTitle>
            <DialogDescription>
              {t("Share your thoughts, ask questions, or offer support to the community.", "Sangiza ibitecyerezo byawe, baza ibibazo, cyangwa utange ubufasha ku muryango.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4 py-4">
            <div>
              <Label htmlFor="newPostTitle">{t("Title", "Umutwe")}</Label>
              <Input id="newPostTitle" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder={t("Enter post title", "Andika umutwe w'inkuru")} />
            </div>
            <div>
              <Label htmlFor="newPostCategory">{t("Category", "Icyiciro")}</Label>
              <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                <SelectTrigger id="newPostCategory">
                  <SelectValue placeholder={t("Select a category", "Hitamo icyiciro")} />
                </SelectTrigger>
                <SelectContent>
                  {(currentLanguage === 'kn' ? forumCategoriesKn : forumCategories).map((cat, index) => (
                    <SelectItem key={cat} value={forumCategories[index]}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newPostContent">{t("Content", "Ibiri muri yo")}</Label>
              <Textarea id="newPostContent" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder={t("Write your post content here...", "Andika ibiri mu nkuru yawe hano...")} rows={6} />
            </div>
            <div>
              <Label htmlFor="newPostTags">{t("Tags (comma separated)", "Amagambo fatizo (atandukanyijwe na koma)")}</Label>
              <Input id="newPostTags" value={newPostTags} onChange={(e) => setNewPostTags(e.target.value)} placeholder={t("e.g., wellness, diabetes, tips", "urugero: ubuzima bwiza, diyabete, inama")} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t("Cancel", "Hagarika")}</Button>
              </DialogClose>
              <Button type="submit">{t("Create Post", "Shyiraho Inkuru")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
