
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Pill, Stethoscope, ActivitySquare, MessageSquareQuote, FlaskConical, Video, CreditCard, ArrowRight, Loader2, LifeBuoy, Users2, ClipboardList, CalendarCheck2, ShieldQuestion, FileHeart, TrendingUp } from 'lucide-react'; 
import { PageHeader } from '@/components/shared/page-header';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const features = [
  {
    title: "Order Medicines",
    description: "Browse our catalog and order your medicines online.",
    href: "/medicines",
    icon: Pill,
    color: "text-primary", 
    bgColor: "bg-primary/10 hover:bg-primary/20",
    borderColor: "border-primary/30",
    roles: ['patient', 'seeker']
  },
  {
    title: "View Medical Tests",
    description: "Access information about available medical tests.",
    href: "/medical-tests",
    icon: ClipboardList, 
    color: "text-accent", 
    bgColor: "bg-accent/10 hover:bg-accent/20",
    borderColor: "border-accent/30",
    roles: ['patient', 'seeker']
  },
  {
    title: "Book Appointments",
    description: "Schedule consultations with healthcare professionals.",
    href: "/appointments/book",
    icon: CalendarCheck2,
    color: "text-green-600 dark:text-green-400", 
    bgColor: "bg-green-500/10 hover:bg-green-500/20",
    borderColor: "border-green-500/30",
    roles: ['patient', 'seeker']
  },
   {
    title: "My Prescriptions",
    description: "View and manage your medical prescriptions.",
    href: "/my-health/prescriptions",
    icon: FileHeart,
    color: "text-primary", 
    bgColor: "bg-primary/10 hover:bg-primary/20",
    borderColor: "border-primary/30",
    roles: ['patient', 'seeker']
  },
  {
    title: "Health Resources",
    description: "Articles and tips for a healthier lifestyle.",
    href: "/health-resources/articles", 
    icon: LifeBuoy,
    color: "text-blue-600 dark:text-blue-400", 
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Community Support",
    description: "Connect with forums and support groups.",
    href: "/community-support/forums", 
    icon: Users2,
    color: "text-purple-600 dark:text-purple-400", 
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    borderColor: "border-purple-500/30",
    roles: ['patient', 'seeker', 'doctor'] 
  },
  {
    title: "Symptom Analyzer",
    description: "Get insights based on your symptoms. (AI Powered)",
    href: "/symptom-analyzer",
    icon: ActivitySquare,
    color: "text-teal-600 dark:text-teal-400", 
    bgColor: "bg-teal-500/10 hover:bg-teal-500/20",
    borderColor: "border-teal-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Medical FAQ",
    description: "Find answers to common medical questions. (AI Powered)",
    href: "/faq",
    icon: MessageSquareQuote,
    color: "text-indigo-600 dark:text-indigo-400", 
    bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
    borderColor: "border-indigo-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Test Yourself",
    description: "Input symptoms for potential disease info. (AI Powered)",
    href: "/test-yourself",
    icon: ShieldQuestion, 
    color: "text-pink-600 dark:text-pink-400", 
    bgColor: "bg-pink-500/10 hover:bg-pink-500/20",
    borderColor: "border-pink-500/30",
    roles: ['patient', 'seeker', 'doctor']
  },
  {
    title: "Online Consultation",
    description: "Consult with doctors online via video call.",
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const storedUserName = localStorage.getItem('mockUserName');
      const storedRole = localStorage.getItem('selectedRole');

      if (!authStatus) {
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
        setUserName(storedUserName || (authStatus === 'admin' ? 'Admin User' : (authStatus === 'doctor' ? 'Doctor User' : 'Valued User')));
        setUserRole(authStatus); // mockAuth might be more reliable for role than selectedRole here
      }
    }
  }, [isClient, router, toast]);

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  const userSpecificFeatures = features.filter(feature => {
    if (userRole === 'admin') return true; // Admin sees all for now, or define admin-specific features
    if (userRole === 'doctor') return feature.roles.includes('doctor') || (!feature.roles.includes('patient') && !feature.roles.includes('seeker')); // Doctors see doctor and general items
    return feature.roles.includes(userRole || 'seeker'); // Patients and seekers see their specific items
  });


  return (
    <AppLayout>
      <PageHeader title={`Welcome, ${userName}!`} />
      <div className="space-y-8">
        <Card className="shadow-lg bg-gradient-to-r from-primary/10 via-background to-accent/10 border-primary/20 hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl font-headline gradient-text">Your Integrated Health Companion</CardTitle>
            <CardDescription className="text-foreground/80">
              MediServe Hub provides a seamless experience for managing your health needs, from ordering medicines to consulting with doctors online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">Explore our services designed to make healthcare more accessible and convenient for you.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userSpecificFeatures.map((feature) => (
             <Link href={feature.href} key={feature.title} className="block group">
                <Card className={`shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 ${feature.bgColor} h-full flex flex-col hover-lift border ${feature.borderColor}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-lg font-medium font-headline ${feature.color}`}>{feature.title}</CardTitle>
                    <feature.icon className={`h-7 w-7 ${feature.color} opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-6`} />
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                   <CardFooter className="pt-2">
                     <div className={`flex items-center text-sm font-medium ${feature.color} group-hover:underline`}>
                        Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                   </CardFooter>
                </Card>
            </Link>
          ))}
        </div>

        {(userRole === 'patient' || userRole === 'seeker') && (
          <Card className="shadow-lg hover-lift">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/>Need to make a payment?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <p className="text-muted-foreground mb-4 sm:mb-0">Securely process your payments for services and orders in RWF.</p>
              <Button asChild className="transition-transform hover:scale-105 active:scale-95">
                <Link href="/payment">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Go to Payments
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
