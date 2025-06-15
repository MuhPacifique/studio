
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users2, Search, PlusCircle, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface SupportGroup {
  id: string;
  name: string;
  nameKn: string;
  description: string;
  descriptionKn: string;
  imageUrl: string;
  aiHint: string;
  memberCount: number;
  category: string;
  categoryKn: string;
  isPrivate: boolean;
  isJoined?: boolean; 
  isRequested?: boolean; 
}

const initialMockSupportGroups: SupportGroup[] = [
  { id: 'sg1', name: 'Diabetes Management Group', nameKn: 'Itsinda ryo Gucunga Diyabete', description: 'A supportive community for individuals managing diabetes. Share tips, recipes, and encouragement.', descriptionKn: 'Umuryango w\'ubufasha ku bantu bacunga diyabete. Sangira inama, amafunguro, n\'inkunga.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'support group people', memberCount: 125, category: 'Chronic Illness', categoryKn: 'Indwara Idakira', isPrivate: false, isJoined: false },
  { id: 'sg2', name: 'New Parents Support Circle', nameKn: 'Itsinda ry\'Ubufasha ku Babyeyi Bashya', description: 'Connect with other new parents to navigate the joys and challenges of parenthood.', descriptionKn: 'Hura n\'abandi babyeyi bashya kugirango muganire ku byishimo n\'imbogamizi z\'ububyeyi.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'parents baby discussion', memberCount: 88, category: 'Parenthood', categoryKn: 'Ububyeyi', isPrivate: true, isJoined: false },
  { id: 'sg3', name: 'Mental Wellness Advocates', nameKn: 'Abaharanira Ubuzima Bwiza bwo mu Mutwe', description: 'A safe space to discuss mental health, share coping strategies, and support one another.', descriptionKn: 'Ahantu hizewe ho kuganirira ku buzima bwo mu mutwe, gusangira uburyo bwo kwihangana, no gufashanya.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'mental health therapy', memberCount: 210, category: 'Mental Health', categoryKn: 'Ubuzima bwo mu Mutwe', isPrivate: false, isJoined: true }, 
  { id: 'sg4', name: 'Fitness & Healthy Living Enthusiasts', nameKn: 'Abakunda Imyitozo Ngororamubiri n\'Ubuzima Bwiza', description: 'For those passionate about fitness, healthy eating, and active lifestyles. Share workout ideas and motivation.', descriptionKn: 'Ku bakunda imyitozo ngororamubiri, kurya neza, n\'ubuzima bukora. Sangira ibitekerezo by\'imyitozo n\'inkunga.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'fitness group exercise', memberCount: 150, category: 'Lifestyle', categoryKn: 'Imibereho', isPrivate: false, isJoined: false },
];

const translate = (enText: string, knText: string) => knText;

const SupportGroupCardSkeleton = () => (
    <Card className="flex flex-col shadow-lg">
        <Skeleton className="h-48 w-full rounded-t-lg" />
        <CardHeader className="pt-4">
            <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-1/4 mt-1" />
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-28" />
        </CardFooter>
    </Card>
);


export default function SupportGroupsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isLoadingData, setIsLoadingData] = useState(true);
  const t = (enText: string, knText: string) => translate(enText, knText);

  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<SupportGroup[]>([]); 

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching initial data (ephemeral)
    const fetchGroups = async () => {
        setIsLoadingData(true);
        // Conceptual: const response = await fetch('/api/support-groups');
        // Conceptual: const data = await response.json();
        // Conceptual: setGroups(data.groups || []);
        await new Promise(resolve => setTimeout(resolve, 300));
        setGroups(initialMockSupportGroups);
        setIsLoadingData(false);
    };
    fetchGroups();
  }, []);


  const handleJoinGroup = (groupId: string) => {
    // Simulate UI update and backend call
    setGroups(prevGroups => 
      prevGroups.map(group => {
        if (group.id === groupId) {
          if (group.isJoined) { 
            router.push(`/community-support/support-groups/${groupId}`);
            return group;
          }
          if (group.isPrivate && !group.isRequested) {
            toast({ title: t("Request Sent (Simulation)", "Icyifuzo Cyoherejwe (Igerageza)"), description: t(`Your request to join "${group.nameKn}" has been sent. Data will not persist.`, `Icyifuzo cyawe cyo kwinjira muri "${group.nameKn}" cyoherejwe. Amakuru ntazabikwa.`)});
            return { ...group, isRequested: true };
          } else if (!group.isPrivate && !group.isJoined) {
            toast({ title: t("Group Joined (Simulation)", "Uramaze Kwinjira mu Itsinda (Igerageza)"), description: t(`You have joined "${group.nameKn}". Data will not persist.`, `Wamaze kwinjira muri "${group.nameKn}". Amakuru ntazabikwa.`)});
            return { ...group, isJoined: true, memberCount: group.memberCount + 1 };
          }
        }
        return group;
      })
    );
  };

  const filteredGroups = groups.filter(group =>
    group.nameKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.categoryKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.descriptionKn.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.nameKn.localeCompare(b.nameKn));

  if (!isClient || isLoadingData) {
    return (
      <AppLayout>
         <PageHeader 
            title={t("Support Groups", "Amatsinda y'Ubufasha")}
            breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/support-groups"}, 
            {label: t("Support Groups", "Amatsinda y'Ubufasha")}
            ]}
        >
             <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-full max-w-md"/>
                <Skeleton className="h-10 w-40"/>
            </div>
        </PageHeader>
        <Card className="mb-6 shadow-lg">
             <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2"/>
                <Skeleton className="h-4 w-3/4"/>
            </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SupportGroupCardSkeleton/>
            <SupportGroupCardSkeleton/>
            <SupportGroupCardSkeleton/>
        </div>
      </AppLayout>
    );
  }

  // Conceptual: if (!isAuthenticated && isClient) { router.replace('/welcome'); return null; }


  return (
    <AppLayout>
      <PageHeader 
        title={t("Support Groups", "Amatsinda y'Ubufasha")}
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
          {label: t("Community & Support", "Ubufatanye & Ubufasha"), href: "/community-support/support-groups"}, 
          {label: t("Support Groups", "Amatsinda y'Ubufasha")}
        ]}
      >
         <div className="flex items-center space-x-2">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                placeholder={t("Search groups...", "Shakisha amatsinda...")} 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button className="transition-transform hover:scale-105 active:scale-95" onClick={() => toast({ title: t("Create Group (Simulation)", "Kora Itsinda (Igerageza)"), description: t("This feature requires backend integration. Data will not persist.", "Iki gice gisaba guhuzwa na seriveri. Amakuru ntazabikwa.")})}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t("Create New Group", "Kora Itsinda Rishya")}
            </Button>
        </div>
      </PageHeader>

      <Card className="mb-6 shadow-lg bg-primary/5 hover-lift dark:bg-primary/10 dark:border-primary/20">
        <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center">
                <Users2 className="mr-2 h-6 w-6"/> {t("Find Your Community", "Shaka Umuryango Wawe")}
            </CardTitle>
            <CardDescription>
                {t("Join support groups to connect with others who share similar health journeys, interests, or challenges. Data is ephemeral in this prototype.", "Injira mu matsinda y'ubufasha kugirango uhure n'abandi mufite ingendo z'ubuzima, ibyo mukunda, cyangwa imbogamizi zisa. Amakuru ni ay'igihe gito muri iyi prototype.")}
            </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <Card key={group.id} className="flex flex-col shadow-lg hover-lift group transition-all duration-300 ease-in-out hover:border-primary/50 dark:border-border">
             <Link href={`/community-support/support-groups/${group.id}`} className="block">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image 
                    src={group.imageUrl} 
                    alt={group.nameKn} 
                    width={400} 
                    height={200} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={group.aiHint} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/30 transition-all"></div>
                </div>
            </Link>
            <CardHeader className="pt-4">
              <div className="flex justify-between items-start">
                <Link href={`/community-support/support-groups/${group.id}`} className="block">
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{group.nameKn}</CardTitle>
                </Link>
                {group.isPrivate && <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">{t("Private", "Rwihishwa")}</Badge>}
                {!group.isPrivate && <Badge variant="outline" className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-400">{t("Public", "Rusange")}</Badge>}
              </div>
              <Badge variant="outline" className="w-fit mt-1">{group.categoryKn}</Badge>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3">{group.descriptionKn}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users2 className="mr-1.5 h-4 w-4" /> {group.memberCount} {t("members", "abanyamuryango")}
              </div>
              <Button 
                variant={group.isJoined ? "outline" : "default"} 
                size="sm" 
                className="transition-transform group-hover:scale-105 active:scale-95"
                onClick={() => handleJoinGroup(group.id)}
                disabled={group.isPrivate && group.isRequested && !group.isJoined}
              >
                {group.isJoined ? <CheckCircle className="mr-2 h-4 w-4 text-green-500"/> : <UserPlus className="mr-2 h-4 w-4" />}
                {group.isJoined ? t('View Group', 'Reba Itsinda') : (group.isPrivate ? (group.isRequested ? t('Requested', 'Byasabwe') : t('Request to Join', 'Saba Kwinjira')) : t('Join Group', 'Injira mu Itsinda'))}
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredGroups.length === 0 && !isLoadingData && (
             <Card className="md:col-span-2 lg:col-span-3 shadow-md">
                <CardContent className="py-10 text-center">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("No support groups found matching your search criteria.", "Nta matsinda y'ubufasha ahuye n'ibyo washakishije yabonetse.")}</p>
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
