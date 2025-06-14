
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Stethoscope, ActivitySquare, MessageSquareQuote, FlaskConical, Video, CreditCard, ArrowRight, Loader2, LifeBuoy, Users2, ClipboardList } from 'lucide-react'; // Added ClipboardList
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
  },
  {
    title: "View Medical Tests",
    description: "Access information about available medical tests.",
    href: "/medical-tests",
    icon: ClipboardList, 
    color: "text-accent", 
    bgColor: "bg-accent/10 hover:bg-accent/20",
  },
  {
    title: "Health Resources",
    description: "Articles and tips for a healthier lifestyle.",
    href: "/health-resources/articles", // Points to first sub-item
    icon: LifeBuoy,
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
  {
    title: "Community & Support",
    description: "Connect with forums and support groups.",
    href: "/community-support/forums", // Points to first sub-item
    icon: Users2,
    color: "text-accent",
    bgColor: "bg-accent/10 hover:bg-accent/20",
  },
  {
    title: "Symptom Analyzer",
    description: "Get insights based on your symptoms. (AI Powered)",
    href: "/symptom-analyzer",
    icon: ActivitySquare,
    color: "text-primary", 
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
  {
    title: "Medical FAQ",
    description: "Find answers to common medical questions. (AI Powered)",
    href: "/faq",
    icon: MessageSquareQuote,
    color: "text-accent", 
    bgColor: "bg-accent/10 hover:bg-accent/20",
  },
  {
    title: "Test Yourself",
    description: "Input symptoms for potential disease info. (AI Powered)",
    href: "/test-yourself",
    icon: FlaskConical,
    color: "text-primary", 
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
  {
    title: "Online Consultation",
    description: "Consult with doctors online via video call.",
    href: "/online-consultation",
    icon: Video,
    color: "text-accent", 
    bgColor: "bg-accent/10 hover:bg-accent/20",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const storedUserName = localStorage.getItem('mockUserName');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in to access the dashboard.",
        });
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        setUserName(storedUserName || (authStatus === 'admin' ? 'Admin User' : 'Valued Patient'));
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

  return (
    <AppLayout>
      <PageHeader title={`Welcome, ${userName}!`} />
      <div className="space-y-8">
        <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover-lift">
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
          {features.map((feature) => (
             <Link href={feature.href} key={feature.title} className="block group">
                <Card className={`shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105 ${feature.bgColor} h-full flex flex-col hover-lift`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-lg font-medium font-headline ${feature.color}`}>{feature.title}</CardTitle>
                    <feature.icon className={`h-7 w-7 ${feature.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                   <CardContent className="pt-2">
                     <div className={`flex items-center text-sm font-medium ${feature.color} group-hover:underline`}>
                        Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                   </CardContent>
                </Card>
            </Link>
          ))}
        </div>

        <Card className="shadow-lg hover-lift">
          <CardHeader>
            <CardTitle className="font-headline">Need to make a payment?</CardTitle>
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
      </div>
    </AppLayout>
  );
}
