
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

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  aiHint: string;
  memberCount: number;
  category: string;
  isPrivate: boolean;
  isJoined?: boolean; 
  isRequested?: boolean; 
}

const initialMockSupportGroups: SupportGroup[] = [
  { id: 'sg1', name: 'Diabetes Management Group', description: 'A supportive community for individuals managing diabetes. Share tips, recipes, and encouragement.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'support group people', memberCount: 125, category: 'Chronic Illness', isPrivate: false, isJoined: false },
  { id: 'sg2', name: 'New Parents Support Circle', description: 'Connect with other new parents to navigate the joys and challenges of parenthood.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'parents baby discussion', memberCount: 88, category: 'Parenthood', isPrivate: true, isJoined: false },
  { id: 'sg3', name: 'Mental Wellness Advocates', description: 'A safe space to discuss mental health, share coping strategies, and support one another.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'mental health therapy', memberCount: 210, category: 'Mental Health', isPrivate: false, isJoined: true }, 
  { id: 'sg4', name: 'Fitness & Healthy Living Enthusiasts', description: 'For those passionate about fitness, healthy eating, and active lifestyles. Share workout ideas and motivation.', imageUrl: 'https://placehold.co/400x250.png', aiHint: 'fitness group exercise', memberCount: 150, category: 'Lifestyle', isPrivate: false, isJoined: false },
];

// Translation helper
const t = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

export default function SupportGroupsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<SupportGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const savedGroups = localStorage.getItem('supportGroupsState');
      return savedGroups ? JSON.parse(savedGroups) : initialMockSupportGroups;
    }
    return initialMockSupportGroups;
  });

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe", currentLanguage),
          description: t("Please log in to access support groups.", "Nyamuneka injira kugirango ubashe kugera ku matsinda y'ubufasha.", currentLanguage),
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast, currentLanguage]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('supportGroupsState', JSON.stringify(groups));
    }
  }, [groups, isClient]);

  const handleJoinGroup = (groupId: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => {
        if (group.id === groupId) {
          if (group.isJoined) { 
            router.push(`/community-support/support-groups/${groupId}`);
            return group;
          }
          if (group.isPrivate && !group.isRequested) {
            toast({ title: t("Request Sent", "Icyifuzo Cyoherejwe", currentLanguage), description: t(`Your request to join "${group.name}" has been sent.`, `Icyifuzo cyawe cyo kwinjira muri "${group.name}" cyoherejwe.`, currentLanguage)});
            return { ...group, isRequested: true };
          } else if (!group.isPrivate && !group.isJoined) {
            toast({ title: t("Group Joined", "Uramaze Kwinjira mu Itsinda", currentLanguage), description: t(`You have joined "${group.name}".`, `Wamaze kwinjira muri "${group.name}".`, currentLanguage)});
            return { ...group, isJoined: true, memberCount: group.memberCount + 1 };
          }
        }
        return group;
      })
    );
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Loading Support Groups...", "Gutegura Amatsinda y'Ubufasha...", currentLanguage)}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title={t("Support Groups", "Amatsinda y'Ubufasha", currentLanguage)}
        breadcrumbs={[
          {label: t("Dashboard", "Imbonerahamwe", currentLanguage), href: "/"}, 
          {label: t("Community & Support", "Ubufatanye & Ubufasha", currentLanguage)}, 
          {label: t("Support Groups", "Amatsinda y'Ubufasha", currentLanguage)}
        ]}
      >
         <div className="flex items-center space-x-2">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                placeholder={t("Search groups...", "Shakisha amatsinda...", currentLanguage)} 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button className="transition-transform hover:scale-105 active:scale-95">
                <PlusCircle className="mr-2 h-4 w-4" /> {t("Create New Group", "Kora Itsinda Rishya", currentLanguage)}
            </Button>
        </div>
      </PageHeader>

      <Card className="mb-6 shadow-lg bg-primary/5 hover-lift dark:bg-primary/10 dark:border-primary/20">
        <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center">
                <Users2 className="mr-2 h-6 w-6"/> {t("Find Your Community", "Shaka Umuryango Wawe", currentLanguage)}
            </CardTitle>
            <CardDescription>
                {t("Join support groups to connect with others who share similar health journeys, interests, or challenges.", "Injira mu matsinda y'ubufasha kugirango uhure n'abandi mufite ingendo z'ubuzima, ibyo mukunda, cyangwa imbogamizi zisa.", currentLanguage)}
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
                    alt={group.name} 
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
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{group.name}</CardTitle>
                </Link>
                {group.isPrivate && <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">{t("Private", "Rwihishwa", currentLanguage)}</Badge>}
                {!group.isPrivate && <Badge variant="outline" className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-400">{t("Public", "Rusange", currentLanguage)}</Badge>}
              </div>
              <Badge variant="outline" className="w-fit mt-1">{group.category}</Badge>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users2 className="mr-1.5 h-4 w-4" /> {group.memberCount} {t("members", "abanyamuryango", currentLanguage)}
              </div>
              <Button 
                variant={group.isJoined ? "outline" : "default"} 
                size="sm" 
                className="transition-transform group-hover:scale-105 active:scale-95"
                onClick={() => handleJoinGroup(group.id)}
                disabled={group.isPrivate && group.isRequested && !group.isJoined}
              >
                {group.isJoined ? <CheckCircle className="mr-2 h-4 w-4 text-green-500"/> : <UserPlus className="mr-2 h-4 w-4" />}
                {group.isJoined ? t('View Group', 'Reba Itsinda', currentLanguage) : (group.isPrivate ? (group.isRequested ? t('Requested', 'Byasabwe', currentLanguage) : t('Request to Join', 'Saba Kwinjira', currentLanguage)) : t('Join Group', 'Injira mu Itsinda', currentLanguage))}
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredGroups.length === 0 && (
             <Card className="md:col-span-2 lg:col-span-3 shadow-md">
                <CardContent className="py-10 text-center">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("No support groups found matching your search criteria.", "Nta matsinda y'ubufasha ahuye n'ibyo washakishije yabonetse.", currentLanguage)}</p>
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
