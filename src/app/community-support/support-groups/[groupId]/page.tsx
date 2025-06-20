
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Users2, MessageCircle, Edit2, Shield, Info, Image as ImageIcon, Send, UserPlus, ThumbsUp, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const translate = (enText: string, knText: string) => knText;

interface SupportGroup {
  id: string;
  name: string;
  nameKn: string;
  description: string;
  descriptionKn: string;
  longDescription?: string;
  longDescriptionKn?: string;
  imageUrl: string;
  aiHint: string;
  memberCount: number;
  category: string;
  categoryKn: string;
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
    likes?: number;
}

const defaultSupportGroupsData: SupportGroup[] = [
  { id: 'sg1', name: 'Diabetes Management Group', nameKn: 'Itsinda ryo Gucunga Diyabete', description: 'A supportive community for individuals managing diabetes.', descriptionKn: 'Umuryango w\'ubufasha ku bantu bacunga diyabete.', longDescription: "This group provides a safe and supportive environment for individuals living with diabetes. We share tips on diet, exercise, medication management, and emotional well-being. Regular virtual meetups are organized.", longDescriptionKn: "Iri tsinda ritanga umwanya wizewe kandi w'ubufasha ku bantu babana na diyabete. Dusangira inama ku mirire, imyitozo ngororamubiri, gucunga imiti, n'imibereho myiza yo mu mutwe. Hategurwa guhura kuri interineti buri gihe.", imageUrl: 'https://placehold.co/600x300.png', aiHint: 'community health meeting', memberCount: 125, category: 'Chronic Illness', categoryKn: 'Indwara Idakira', isPrivate: false, adminName: "Sarah M.", adminAvatar: "https://placehold.co/40x40.png?text=SM", adminInitials: "SM"},
  { id: 'sg2', name: 'New Parents Support Circle', nameKn: 'Itsinda ry\'Ubufasha ku Babyeyi Bashya', description: 'Connect with other new parents to navigate the joys and challenges of parenthood.', descriptionKn: 'Hura n\'abandi babyeyi bashya kugirango muganire ku byishimo n\'imbogamizi z\'ububyeyi.', longDescription: "Welcome new parents! This circle is for sharing experiences, asking questions, and finding support during the incredible journey of early parenthood. From sleep tips to feeding advice, we're here for each other.", longDescriptionKn: "Murakaza neza babyeyi bashya! Iri tsinda ni iryo gusangira uburambe, kubaza ibibazo, no gushaka ubufasha mu rugendo rutangaje rw'ububyeyi bwa mbere. Kuva ku nama z'ibitotsi kugeza ku nama z'imirire, turi hano kubwanyu.", imageUrl: 'https://placehold.co/600x300.png', aiHint: 'parents children group', memberCount: 88, category: 'Parenthood', categoryKn: 'Ububyeyi', isPrivate: true, adminName: "David K.", adminAvatar: "https://placehold.co/40x40.png?text=DK", adminInitials: "DK" },
  { id: 'sg3', name: 'Mental Wellness Advocates', nameKn: 'Abaharanira Ubuzima Bwiza bwo mu Mutwe', description: 'A safe space to discuss mental health, share coping strategies, and support one another.', descriptionKn: 'Ahantu hizewe ho kuganirira ku buzima bwo mu mutwe, gusangira uburyo bwo kwihangana, no gufashanya.', longDescription: "Our mission is to advocate for mental wellness and provide a judgment-free zone for discussion. Share your story, learn coping mechanisms, and connect with others who understand.", longDescriptionKn: "Intego yacu ni uguharanira ubuzima bwiza bwo mu mutwe no gutanga ahantu ho kuganirira hatabamo urubanza. Sangiza inkuru yawe, iga uburyo bwo kwihangana, kandi uhure n'abandi babyumva.", imageUrl: 'https://placehold.co/600x300.png', aiHint: 'mental wellness discussion', memberCount: 210, category: 'Mental Health', categoryKn: 'Ubuzima bwo mu Mutwe', isPrivate: false, adminName: "Laura P.", adminAvatar: "https://placehold.co/40x40.png?text=LP", adminInitials: "LP" },
];

const defaultGroupPostsData: { [groupId: string]: GroupPost[] } = {
    sg1: [
        {id: 'gp1', author: 'Alice W.', authorAvatar: 'https://placehold.co/40x40.png?text=AW', authorInitials: 'AW', timestamp: 'Amasaha 3 ashize', text: "Nagerageje uburyo bushya bwo guteka pizza ya cauliflower irimo ibirungo bike, yari iryoshye cyane! Nshimishijwe no kubisangiza niba hari ubishaka.", imageUrl: 'https://placehold.co/300x200.png', imageAiHint: 'healthy food recipe', likes: 5},
        {id: 'gp2', author: 'Umunyamabanga (Sarah M.)', authorAvatar: 'https://placehold.co/40x40.png?text=SM', authorInitials: 'SM', timestamp: 'Umunsi 1 ushize', text: "Kwibutsa: Ibibazo n'ibisubizo byacu bya buri kwezi kuri interineti na Dr. Evans biteganyijwe ku wa kabiri utaha saa moya z'ijoro. Link izashyirwaho vuba!", likes: 12},
    ],
    sg3: [
        {id: 'gp3', author: 'John B.', authorAvatar: 'https://placehold.co/40x40.png?text=JB', authorInitials: 'JB', timestamp: 'Amasaha 5 ashize', text: "Uyu munsi numvaga meze nk'uremerewe gato. Hari inama zihuse zo guhangana n'ubwoba butunguranye mu kazi?", likes: 8},
    ],
    sg2: [],
};


const GroupPostSkeleton = () => (
    <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-40 w-full mt-3 rounded-lg" />
        </CardContent>
        <CardFooter className="border-t pt-3 flex space-x-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
        </CardFooter>
    </Card>
);

const GroupDetailSkeleton = ({ t_func }: { t_func: (en: string, kn: string) => string }) => (
    <>
    <div className="relative mb-8">
        <Skeleton className="w-full h-56 md:h-72 rounded-lg" />
        <div className="absolute bottom-0 left-0 p-6">
            <Skeleton className="h-6 w-24 mb-2 rounded-full" />
            <Skeleton className="h-10 w-3/4 mb-1" />
            <Skeleton className="h-5 w-1/2" />
        </div>
    </div>
     <PageHeader 
        title="" 
        breadcrumbs={[
          {label: t_func("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t_func("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/support-groups"}, 
          {label: t_func("Support Groups", "Amatsinda y'Ubufasha"), href: "/community-support/support-groups"},
          {label: t_func("Loading...", "Gutegura...")}
        ]}
      />
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-[-2rem]">
        <div className="lg:col-span-2 space-y-6">
             <Card className="shadow-xl">
                <CardHeader><Skeleton className="h-6 w-1/2"/></CardHeader>
                <CardContent>
                    <Skeleton className="h-20 w-full mb-3"/>
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-9 w-28"/>
                        <Skeleton className="h-9 w-36"/>
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-8 w-1/3 mb-2"/>
            <GroupPostSkeleton/>
            <GroupPostSkeleton/>
        </div>
        <div className="space-y-6">
            <Card className="shadow-xl">
                <CardHeader><Skeleton className="h-6 w-3/4"/></CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-5/6"/>
                    <Separator/>
                    <Skeleton className="h-4 w-1/2"/>
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-5 w-1/4"/>
                </CardContent>
            </Card>
            <Card className="shadow-xl">
                <CardHeader><Skeleton className="h-6 w-1/2"/></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-8 w-full"/>
                </CardContent>
            </Card>
        </div>
     </div>
    </>
);

export default function SupportGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const t = (enText: string, knText: string) => translate(enText, knText);

  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [group, setGroup] = useState<SupportGroup | null>(null); 
  const [posts, setPosts] = useState<GroupPost[]>([]); 
  const [newPostText, setNewPostText] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const groupId = params.groupId as string;

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching group details and posts (ephemeral)
    const fetchGroupData = async () => {
        setIsLoadingData(true);
        // Conceptual: const groupRes = await fetch(`/api/support-groups/${groupId}`);
        // Conceptual: const groupData = await groupRes.json();
        // Conceptual: const postsRes = await fetch(`/api/support-groups/${groupId}/posts`);
        // Conceptual: const postsData = await postsRes.json();
        await new Promise(resolve => setTimeout(resolve, 300));
        const foundGroup = defaultSupportGroupsData.find(g => g.id === groupId);

        if (foundGroup) {
            setGroup(foundGroup);
            setPosts((defaultGroupPostsData[groupId] || []).sort((a,b) => (a.timestamp === t('Just now', 'Nonaha') ? -1 : b.timestamp === t('Just now', 'Nonaha') ? 1 : 0) || new Date(b.timestamp.replace('ishize','ago')).getTime() - new Date(a.timestamp.replace('ishize','ago')).getTime()));
        } else {
            toast({ variant: "destructive", title: t("Group not found", "Itsinda ntiribonetse") });
            router.push('/community-support/support-groups');
        }
        setIsLoadingData(false);
    };
    if (groupId) {
        fetchGroupData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, groupId, router]);

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newPostText.trim()){
        toast({variant: "destructive", title: t("Cannot submit empty post", "Ntushobora kohereza ubutumwa burimo ubusa")});
        return;
    }
    setIsSubmittingPost(true);
    
    const postToAdd: GroupPost = {
        id: `gp${Date.now()}`,
        author: t('Current User (Mock)', 'Ukoresha (By\'agateganyo)'),
        authorAvatar: 'https://placehold.co/40x40.png?text=U',
        authorInitials: "U",
        timestamp: t('Just now', 'Nonaha'),
        text: newPostText,
        likes: 0
    };

    // Simulate UI update and backend call
    setPosts(prevPosts => [postToAdd, ...prevPosts]);
    
    setNewPostText('');
    setIsSubmittingPost(false);
    toast({title: t("Post Added (Simulation)", "Ubutumwa Bwongeweho (Igerageza)"), description: t("Your post has been added. Data will not persist.", "Ubutumwa bwawe bwongeweho. Amakuru ntazabikwa.")});
  };
  
  const handleLikeGroupPost = (postId: string) => {
    // Simulate UI update and backend call
    setPosts(prevPosts => prevPosts.map(p => p.id === postId ? {...p, likes: (p.likes || 0) + 1} : p));
    toast({ title: t("Post Liked (Simulation)", "Ubutumwa Bwakunzwe (Igerageza)"), description: t("Data will not persist.", "Amakuru ntazabikwa.") });
  }

  const handleCommentMock = () => {
    toast({description: t("Commenting feature coming soon! (Requires backend)", "Igice cyo gutanga ibitecyerezo kizaza vuba! (Bisaba seriveri)")})
  };

  const handleInviteMock = () => {
    toast({description: t("Feature to invite members coming soon! (Requires backend)", "Igice cyo gutumira abanyamuryango kizaza vuba! (Bisaba seriveri)")})
  };

  const handleAddImageMock = () => {
    toast({description: t("Image upload for posts coming soon! (Requires backend)", "Gushyiraho amafoto ku butumwa bizaza vuba! (Bisaba seriveri)")})
  };


  if (!isClient || isLoadingData || !group) {
    return (
      <AppLayout>
        <GroupDetailSkeleton t_func={t}/>
      </AppLayout>
    );
  }

  // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }

  return (
    <AppLayout>
      <div className="relative mb-8">
        <Image 
            src={group.imageUrl} 
            alt={group.nameKn + " " + t("banner", "ikirango")} 
            width={1200} 
            height={300} 
            className="w-full h-56 md:h-72 object-cover rounded-lg shadow-lg"
            data-ai-hint={group.aiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-lg"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
            <Badge variant="secondary" className="mb-2 bg-white/20 backdrop-blur-sm text-white border-white/30">{group.categoryKn}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold font-headline drop-shadow-md">{group.nameKn}</h1>
            <p className="text-sm md:text-md mt-1 drop-shadow-sm">{group.descriptionKn}</p>
        </div>
      </div>
      
      <PageHeader 
        title="" 
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/support-groups"}, 
          {label: t("Support Groups", "Amatsinda y'Ubufasha"), href: "/community-support/support-groups"},
          {label: group.nameKn.substring(0,30) + "..."}
        ]}
      />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-[-2rem]"> 
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl hover-lift">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center text-primary"><Edit2 className="mr-2 h-5 w-5"/> {t("Share with the group", "Sangiza itsinda")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddPost} className="space-y-3">
                        <Textarea 
                            placeholder={t(`What's on your mind? Share advice, ask questions, or post an update... (Mock username)`, `Utekereza iki? Tanga inama, baza ibibazo, cyangwa shyiraho amakuru mashya... (Izina ry'ukoresha ry'agateganyo)`)}
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                        <div className="flex justify-between items-center">
                            <Button type="button" variant="outline" size="sm" onClick={handleAddImageMock}>
                                <ImageIcon className="mr-2 h-4 w-4"/> {t("Add Image", "Ongeraho Ifoto")}
                            </Button>
                            <Button type="submit" className="transition-transform hover:scale-105 active:scale-95" disabled={isSubmittingPost}>
                                {isSubmittingPost ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                {isSubmittingPost ? t('Posting...', 'Kohereza...') : t('Post to Group', 'Ohereza mu Itsinda')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-semibold font-headline text-foreground">{t("Group Activity", "Ibikorwa by'Itsinda")}</h2>
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
                                <Image src={post.imageUrl} alt={t("Post image", "Ifoto y'ubutumwa")} width={500} height={300} className="w-full object-cover" data-ai-hint={post.imageAiHint || "group post image"}/>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex space-x-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => handleLikeGroupPost(post.id)}>
                            <ThumbsUp className="mr-1.5 h-4 w-4"/> {post.likes || 0} {t("Like", "Kunda")}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={handleCommentMock}>
                            <MessageCircle className="mr-1.5 h-4 w-4"/> {t("Comment", "Igitecyerezo")}
                        </Button>
                    </CardFooter>
                </Card>
                ))
            ) : (
                <Card className="shadow-md">
                    <CardContent className="py-10 text-center">
                        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t("No posts in this group yet. Start the conversation! Group posts are ephemeral in this prototype.", "Nta butumwa buri muri iri tsinda. Tangira ikiganiro! Ubutumwa bwo mu itsinda ni ubw'igihe gito muri iyi prototype.")}</p>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="space-y-6 sticky top-24">
            <Card className="shadow-xl hover-lift">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center text-primary"><Info className="mr-2 h-5 w-5"/>{t("About This Group", "Ibyerekeye Iri Tsinda")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{group.longDescriptionKn || group.descriptionKn}</p>
                    <Separator/>
                    <div className="text-sm">
                        <span className="font-medium text-foreground">{t("Administered by:", "Riyobowe na:")}</span>
                        <div className="flex items-center space-x-2 mt-1">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={group.adminAvatar} alt={group.adminName} data-ai-hint="admin portrait"/>
                                <AvatarFallback>{group.adminInitials}</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">{group.adminName}</span>
                        </div>
                    </div>
                     <div className="text-sm">
                        <span className="font-medium text-foreground">{t("Members:", "Abanyamuryango:")}</span> <span className="text-muted-foreground">{group.memberCount}</span>
                    </div>
                    {group.isPrivate && <Badge variant="secondary" className="w-fit"><Shield className="mr-1.5 h-3 w-3"/> {t("Private Group", "Itsinda Rwihishwa")}</Badge>}
                    <Button className="w-full transition-transform hover:scale-105 active:scale-95" onClick={handleInviteMock}>
                        <UserPlus className="mr-2 h-4 w-4"/> {t("Invite Members", "Tumira Abanyamuryango")}
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-xl hover-lift">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center text-primary"><Users2 className="mr-2 h-5 w-5"/>{t("Group Members", "Abanyamuryango b'Itsinda")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                    {[...Array(Math.min(group.memberCount, 5))].map((_, i) => ( 
                        <div key={i} className="flex items-center space-x-2 p-1.5 hover:bg-muted/50 rounded-md">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40.png?text=M${i+1}`} data-ai-hint="user avatar"/>
                                <AvatarFallback>M{i+1}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{t("Member", "Umunyamuryango")} {i+1}</span>
                        </div>
                    ))}
                    {group.memberCount > 5 && <p className="text-xs text-center text-muted-foreground pt-2">...{t("and", "n'")} {group.memberCount -5} {t("more members", "abandi banyamuryango.")}.</p>}
                </CardContent>
            </Card>
        </div>
    </div>

    </AppLayout>
  );
}
