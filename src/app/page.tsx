
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Pill, Stethoscope, ActivitySquare, MessageSquareQuote, FlaskConical, Video, CreditCard, ArrowRight, Loader2, LifeBuoy, Users2, ClipboardList, CalendarCheck2, ShieldQuestion, FileHeart } from 'lucide-react'; 
import { PageHeader } from '@/components/shared/page-header';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Feature {
    title: string;
    titleKn: string;
    description: string;
    descriptionKn: string;
    href: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    roles: string[];
}

const features: Feature[] = [
  {
    title: "Order Medicines",
    titleKn: "Gura Imithi",
    description: "Browse our catalog and order your medicines online.",
    descriptionKn: "Reba urutonde rw'imiti kandi uyitumize kuri interineti.",
    href: "/medicines",
    icon: Pill,
    color: "text-primary", 
    bgColor: "bg-primary/10 hover:bg-primary/20",
    borderColor: "border-primary/30",
    roles: ['patient', 'seeker']
  },
  {
    title: "View Medical Tests",
    titleKn: "Reba Ibipimo",
    description: "Access information about available medical tests.",
    descriptionKn: "Reba amakuru ajyanye n'ibipimo bya muganga biboneka.",
    href: "/medical-tests",
    icon: ClipboardList, 
    color: "text-accent", 
    bgColor: "bg-accent/10 hover:bg-accent/20",
    borderColor: "border-accent/30",
    roles: ['patient', 'seeker']
  },
  {
    title: "Book Appointments",
    titleKn: "Fata Igihe kwa Muganga",
    description: "Schedule consultations with healthcare professionals.",
    descriptionKn: "Fata igihe cyo kubonana n'abaganga b'inzobere.",
    href: "/appointments/book",
    icon: CalendarCheck2,
    color: "text-green-600 dark:text-green-400", 
    bgColor: "bg-green-500/10 hover:bg-green-500/20",
    borderColor: "border-green-500/30",
    roles: ['patient', 'seeker']
  },
   {
    title: "My Prescriptions",
    titleKn: "Imiti Nandikiwe",
    description: "View and manage your medical prescriptions.",
    descriptionKn: "Reba kandi ucunge imiti wandikiwe na muganga.",
    href: "/my-health/prescriptions",
    icon: FileHeart,
    color: "text-primary", 
    bgColor: "bg-primary/10 hover:bg-primary/20",
    borderColor: "border-primary/30",
    roles: ['patient', 'seeker']
  },
  {
    title: "Health Resources",
    titleKn: "Amakuru y'Ubuzima",
    description: "Articles and tips for a healthier lifestyle.",
    descriptionKn: "Inyandiko n'inama z'ubuzima bwiza.",
    href: "/health-resources/articles", 
    icon: LifeBuoy,
    color: "text-blue-600 dark:text-blue-400", 
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Community Support",
    titleKn: "Ubufasha Rusange",
    description: "Connect with forums and support groups.",
    descriptionKn: "Hura n'ibiganiro rusange n'amatsinda y'ubufasha.",
    href: "/community-support/forums", 
    icon: Users2,
    color: "text-purple-600 dark:text-purple-400", 
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    borderColor: "border-purple-500/30",
    roles: ['patient', 'seeker', 'doctor'] 
  },
  {
    title: "Symptom Analyzer",
    titleKn: "Isesengura ry'Ibimenyetso",
    description: "Get insights based on your symptoms. (AI Powered)",
    descriptionKn: "Menya byinshi bishingiye ku bimenyetso byawe. (AI)",
    href: "/symptom-analyzer",
    icon: ActivitySquare,
    color: "text-teal-600 dark:text-teal-400", 
    bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
    borderColor: "border-teal-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Medical FAQ",
    titleKn: "Ibibazo Bikunze Kubazwa",
    description: "Find answers to common medical questions. (AI Powered)",
    descriptionKn: "Shaka ibisubizo by'ibibazo bikunze kubazwa mu buvuzi. (AI)",
    href: "/faq",
    icon: MessageSquareQuote,
    color: "text-indigo-600 dark:text-indigo-400", 
    bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
    borderColor: "border-indigo-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Test Yourself",
    titleKn: "Isúzumé",
    description: "Input symptoms for potential disease info. (AI Powered)",
    descriptionKn: "Andika ibimenyetso byawe umenye indwara zishoboka. (AI)",
    href: "/test-yourself",
    icon: ShieldQuestion, 
    color: "text-pink-600 dark:text-pink-400", 
    bgColor: "bg-pink-500/10 hover:bg-pink-500/20",
    borderColor: "border-pink-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Online Consultation",
    titleKn: "Ubujyanama kuri Interineti",
    description: "Consult with doctors online via video call.",
    descriptionKn: "Vugana n'abaganga kuri interineti ukoresheje videwo.",
    href: "/online-consultation",
    icon: Video,
    color: "text-orange-600 dark:text-orange-400", 
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    borderColor: "border-orange-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
];

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'kn'>('kn');

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) {
      setPreferredLanguage(lang);
    } else {
      localStorage.setItem('mockUserLang', 'kn'); // Set default if not present
    }
  }, []);
  
  const t = (enText: string, knText: string) => preferredLanguage === 'kn' ? knText : enText;

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const storedUserName = localStorage.getItem('mockUserName');
      const storedRole = localStorage.getItem('selectedRole');
      const storedLang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;

      if (storedLang) {
        setPreferredLanguage(storedLang);
      }

      if (!authStatus) {
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
        setUserName(storedUserName || (authStatus === 'admin' ? t('Admin User', 'Umunyamabanga Mukuru') : (authStatus === 'doctor' ? t('Doctor User', 'Muganga Mukuru') : t('Valued User', 'Ukoresha w\'Agaciro'))));
        setUserRole(authStatus); 
      }
    }
  }, [isClient, router, toast, preferredLanguage]); // Added preferredLanguage as dependency

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t('Loading dashboard...','Gutegura imbonerahamwe...')}</p>
        </div>
      </AppLayout>
    );
  }

  const userSpecificFeatures = features.filter(feature => {
    if (userRole === 'admin') return true; 
    if (userRole === 'doctor') return feature.roles.includes('doctor') || (!feature.roles.includes('patient') && !feature.roles.includes('seeker')); 
    return feature.roles.includes(userRole || 'seeker'); 
  });


  return (
    <AppLayout>
      <PageHeader title={`${t('Welcome', 'Murakaza neza')}, ${userName}!`} />
      <div className="space-y-8">
        <Card className="shadow-lg bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/20 hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl font-headline gradient-text">{t('Your Integrated Health Companion', 'Umufasha wawe w\'Ubuzima Byose Hamwe')}</CardTitle>
            <CardDescription className="text-foreground/80">
              {t('MediServe Hub provides a seamless experience for managing your health needs, from ordering medicines to consulting with doctors online.', 
                 'MediServe Hub itanga uburyo bworoshye bwo gucunga ubuzima bwawe, kuva ku kugura imiti kugeza ku kuvugana n\'abaganga kuri interineti.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">
              {t('Explore our services designed to make healthcare more accessible and convenient for you.',
                 'Shakisha serivisi zacu zateguwe kugira ngo ubuzima bugere kuri bose kandi buborohere.')}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userSpecificFeatures.map((feature) => (
             <Link href={feature.href} key={feature.title} className="block group">
                <Card className={`shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 ${feature.bgColor} h-full flex flex-col hover-lift border ${feature.borderColor}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-lg font-medium font-headline ${feature.color}`}>{t(feature.title, feature.titleKn)}</CardTitle>
                    <feature.icon className={`h-7 w-7 ${feature.color} opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-6`} />
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{t(feature.description, feature.descriptionKn)}</p>
                  </CardContent>
                   <CardFooter className="pt-2">
                     <div className={`flex items-center text-sm font-medium ${feature.color} group-hover:underline`}>
                        {t('Explore', 'Shakisha')} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                   </CardFooter>
                </Card>
            </Link>
          ))}
        </div>

        {(userRole === 'patient' || userRole === 'seeker') && (
          <Card className="shadow-lg hover-lift">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/>{t('Need to make a payment?', 'Ukeneye Kwishyura?')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <p className="text-muted-foreground mb-4 sm:mb-0">{t('Securely process your payments for services and orders in RWF.', 'Ishyura serivisi n\'ibicuruzwa byawe mu mafaranga y\'u Rwanda (RWF) mu buryo bwizewe.')}</p>
              <Button asChild className="transition-transform hover:scale-105 active:scale-95">
                <Link href="/payment">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('Go to Payments', 'Jya Kwishyura')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
