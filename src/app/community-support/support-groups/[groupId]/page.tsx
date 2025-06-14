
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Users2, MessageCircle, Edit2, Shield, Info, Image as ImageIcon, Send, UserPlus } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  aiHint: string;
  memberCount: number;
  category: string;
  isPrivate: boolean;
  adminName: string;
  adminAvatar: string;
  adminInitials: string;
}

interface GroupPost {
    id: string;
    author: string;
    authorAvatar: string;
    authorInitials: string;
    timestamp: string;
    text: string;
    imageUrl?: string;
    imageAiHint?: string;
}

const mockSupportGroupsData: SupportGroup[] = [
  { id: 'sg1', name: 'Diabetes Management Group', description: 'A supportive community for individuals managing diabetes.', longDescription: "This group provides a safe and supportive environment for individuals living with diabetes. We share tips on diet, exercise, medication management, and emotional well-being. Regular virtual meetups are organized.", imageUrl: 'https://placehold.co/600x300.png', aiHint: 'community health meeting', memberCount: 125, category: 'Chronic Illness', isPrivate: false, adminName: "Sarah M.", adminAvatar: "https://placehold.co/40x40.png?text=SM", adminInitials: "SM"},
  { id: 'sg2', name: 'New Parents Support Circle', description: 'Connect with other new parents to navigate the joys and challenges of parenthood.', longDescription: "Welcome new parents! This circle is for sharing experiences, asking questions, and finding support during the incredible journey of early parenthood. From sleep tips to feeding advice, we're here for each other.", imageUrl: 'https://placehold.co/600x300.png', aiHint: 'parents children group', memberCount: 88, category: 'Parenthood', isPrivate: true, adminName: "David K.", adminAvatar: "https://placehold.co/40x40.png?text=DK", adminInitials: "DK" },
  { id: 'sg3', name: 'Mental Wellness Advocates', description: 'A safe space to discuss mental health, share coping strategies, and support one another.', longDescription: "Our mission is to advocate for mental wellness and provide a judgment-free zone for discussion. Share your story, learn coping mechanisms, and connect with others who understand.", imageUrl: 'https://placehold.co/600x300.png', aiHint: 'mental wellness discussion', memberCount: 210, category: 'Mental Health', isPrivate: false, adminName: "Laura P.", adminAvatar: "https://placehold.co/40x40.png?text=LP", adminInitials: "LP" },
];

const mockGroupPosts: { [groupId: string]: GroupPost[] } = {
    sg1: [
        {id: 'gp1', author: 'Alice W.', authorAvatar: 'https://placehold.co/40x40.png?text=AW', authorInitials: 'AW', timestamp: '3 hours ago', text: "Just tried a new low-carb recipe for cauliflower pizza, it was delicious! Happy to share if anyone's interested.", imageUrl: 'https://placehold.co/300x200.png', imageAiHint: 'healthy food recipe'},
        {id: 'gp2', author: 'Admin (Sarah M.)', authorAvatar: 'https://placehold.co/40x40.png?text=SM', authorInitials: 'SM', timestamp: '1 day ago', text: "Friendly reminder: Our monthly virtual Q&A with Dr. Evans is scheduled for next Tuesday at 7 PM. Link will be posted soon!"},
    ],
    sg3: [
        {id: 'gp3', author: 'John B.', authorAvatar: 'https://placehold.co/40x40.png?text=JB', authorInitials: 'JB', timestamp: '5 hours ago', text: "Feeling a bit overwhelmed today. Any quick tips for managing sudden anxiety spikes during work?"},
    ],
    sg2: [], // New parents group might not have posts yet or they are more chat-like
};


export default function SupportGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const groupId = params.groupId as string;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({ variant: "destructive", title: "Access Denied", description: "Please log in to view support groups." });
        router.replace('/welcome');
        return;
      }
      setIsAuthenticated(true);
      
      const foundGroup = mockSupportGroupsData.find(g => g.id === groupId);
      if (foundGroup) {
        setGroup(foundGroup);
        setPosts(mockGroupPosts[groupId] || []);
      } else {
        toast({ variant: "destructive", title: "Group not found" });
        router.push('/community-support/support-groups');
      }
    }
  }, [isClient, router, toast, groupId]);

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newPostText.trim()){
        toast({variant: "destructive", title: "Cannot submit empty post"});
        return;
    }
    setIsSubmittingPost(true);
    // Mock post submission
    setTimeout(() => {
        const postToAdd: GroupPost = {
            id: `gp${Date.now()}`,
            author: localStorage.getItem('mockUserName') || 'You', // Mock author
            authorAvatar: 'https://placehold.co/40x40.png?text=U',
            authorInitials: (localStorage.getItem('mockUserName') || 'U').substring(0,2).toUpperCase(),
            timestamp: 'Just now',
            text: newPostText,
        };
        setPosts(prev => [postToAdd, ...prev]); // Add new post to the top
        setNewPostText('');
        setIsSubmittingPost(false);
        toast({title: "Post Added (Mock)"});
    }, 1000);
  };


  if (!isClient || !isAuthenticated || !group) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading group details...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative mb-8">
        <Image 
            src={group.imageUrl} 
            alt={`${group.name} banner`} 
            width={1200} 
            height={300} 
            className="w-full h-56 md:h-72 object-cover rounded-lg shadow-lg"
            data-ai-hint={group.aiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-lg"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
            <Badge variant="secondary" className="mb-2 bg-white/20 backdrop-blur-sm text-white border-white/30">{group.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold font-headline drop-shadow-md">{group.name}</h1>
            <p className="text-sm md:text-md mt-1 drop-shadow-sm">{group.description}</p>
        </div>
      </div>
      
      <PageHeader 
        title="" // Title is handled by the banner section
        breadcrumbs={[
          {label: "Dashboard", href: "/"}, 
          {label: "Community & Support", href: "/community-support/forums"}, 
          {label: "Support Groups", href: "/community-support/support-groups"},
          {label: group.name.substring(0,30) + "..."}
        ]}
      />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-[-2rem]"> {/* Overlap slightly with banner */}
        <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card */}
            <Card className="shadow-xl hover-lift">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center text-primary"><Edit2 className="mr-2 h-5 w-5"/> Share with the group</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddPost} className="space-y-3">
                        <Textarea 
                            placeholder={`What's on your mind, ${localStorage.getItem('mockUserName') || 'member'}? Share advice, ask questions, or post an update...`}
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                        <div className="flex justify-between items-center">
                            <Button type="button" variant="outline" size="sm" onClick={() => toast({description: "Image upload for posts coming soon!"})}>
                                <ImageIcon className="mr-2 h-4 w-4"/> Add Image (Mock)
                            </Button>
                            <Button type="submit" className="transition-transform hover:scale-105 active:scale-95" disabled={isSubmittingPost}>
                                {isSubmittingPost ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                {isSubmittingPost ? 'Posting...' : 'Post to Group'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Group Feed */}
            <h2 className="text-2xl font-semibold font-headline text-foreground">Group Activity</h2>
            {posts.length > 0 ? (
                posts.map(post => (
                <Card key={post.id} className="shadow-lg hover-lift">
                    <CardHeader>
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.authorAvatar} alt={post.author} data-ai-hint="user avatar"/>
                                <AvatarFallback>{post.authorInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-foreground">{post.author}</p>
                                <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{post.text}</p>
                        {post.imageUrl && (
                            <div className="mt-3 rounded-lg overflow-hidden border">
                                <Image src={post.imageUrl} alt="Post image" width={500} height={300} className="w-full object-cover" data-ai-hint={post.imageAiHint || "group post image"}/>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex space-x-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <ThumbsUp className="mr-1.5 h-4 w-4"/> Like (Mock)
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <MessageCircle className="mr-1.5 h-4 w-4"/> Comment (Mock)
                        </Button>
                    </CardFooter>
                </Card>
                ))
            ) : (
                <Card className="shadow-md">
                    <CardContent className="py-10 text-center">
                        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No posts in this group yet. Start the conversation!</p>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Sidebar with Group Info */}
        <div className="space-y-6 sticky top-24">
            <Card className="shadow-xl hover-lift">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center text-primary"><Info className="mr-2 h-5 w-5"/>About This Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{group.longDescription || group.description}</p>
                    <Separator/>
                    <div className="text-sm">
                        <span className="font-medium text-foreground">Administered by:</span>
                        <div className="flex items-center space-x-2 mt-1">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={group.adminAvatar} alt={group.adminName} data-ai-hint="admin portrait"/>
                                <AvatarFallback>{group.adminInitials}</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">{group.adminName}</span>
                        </div>
                    </div>
                     <div className="text-sm">
                        <span className="font-medium text-foreground">Members:</span> <span className="text-muted-foreground">{group.memberCount}</span>
                    </div>
                    {group.isPrivate && <Badge variant="secondary" className="w-fit"><Shield className="mr-1.5 h-3 w-3"/> Private Group</Badge>}
                    <Button className="w-full transition-transform hover:scale-105 active:scale-95" onClick={() => toast({description: "Feature to invite members coming soon!"})}>
                        <UserPlus className="mr-2 h-4 w-4"/> Invite Members (Mock)
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-xl hover-lift">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center text-primary"><Users2 className="mr-2 h-5 w-5"/>Group Members (Mock)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                    {[...Array(Math.min(group.memberCount, 5))].map((_, i) => ( // Show up to 5 mock members
                        <div key={i} className="flex items-center space-x-2 p-1.5 hover:bg-muted/50 rounded-md">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40.png?text=M${i+1}`} data-ai-hint="user avatar"/>
                                <AvatarFallback>M{i+1}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">Member {i+1}</span>
                        </div>
                    ))}
                    {group.memberCount > 5 && <p className="text-xs text-center text-muted-foreground pt-2">...and {group.memberCount -5} more members.</p>}
                </CardContent>
            </Card>
        </div>
    </div>

    </AppLayout>
  );
}
