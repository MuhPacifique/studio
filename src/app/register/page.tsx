
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';

const preferredLanguage = typeof window !== 'undefined' ? (localStorage.getItem('mockUserLang') as 'en' | 'kn' || 'kn') : 'kn';
const t = (enText: string, knText: string) => preferredLanguage === 'kn' ? knText : enText;

const registerSchema = z.object({
  fullName: z.string().min(2, { message: t("Full name must be at least 2 characters.", "Amazina yuzuye agomba kuba nibura inyuguti 2.") }),
  email: z.string().email({ message: t("Invalid email address.", "Aderesi email yanditse nabi.") }),
  phone: z.string().min(10, { message: t("Phone number must be at least 10 digits.", "Nimero ya telefone igomba kuba nibura imibare 10.") }).regex(/^\+?[0-9\s-()]*$/, t("Invalid phone number format.", "Uburyo bwanditsemo nimero ya telefone ntabwo ari bwo.")),
  password: z.string().min(6, { message: t("Password must be at least 6 characters.", "Ijambobanga rigomba kuba nibura inyuguti 6.") }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: t("Passwords don't match", "Amagambobanga ntabwo ahura"),
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  useEffect(() => {
    const role = localStorage.getItem('selectedRole');
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if(lang) setCurrentLanguage(lang);

    if (!role || role === 'admin') { 
      toast({ variant: "destructive", title: currentT("Role not selected", "Uruhare Ntibwahiswemo"), description: currentT("Please select a role before registering.", "Nyamuneka hitamo uruhare mbere yo kwiyandikisha.") });
      router.replace('/welcome'); 
    } else {
      setSelectedRole(role);
    }
  }, [router, toast, currentLanguage]); // Added currentLanguage to dependency

  const currentT = (enText: string, knText: string) => currentLanguage === 'kn' ? knText : enText;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const roleToRegister = localStorage.getItem('selectedRole') || 'patient'; 

    localStorage.setItem('mockAuth', roleToRegister);
    localStorage.setItem('mockUserName', data.fullName);
    localStorage.setItem('mockUserEmail', data.email);
    localStorage.setItem('mockUserPhone', data.phone);
    
    toast({
      title: currentT("Registration Successful", "Kwiyandikisha Byagenze Neza"),
      description: `${currentT("Your", "Iyawe")} ${roleToRegister} ${currentT("account has been created. Welcome,", "konti yafunguwe. Murakaza neza,")} ${data.fullName}!`,
    });
    router.push('/'); 
  };
  
  const roleTitles: Record<string, { en: string, kn: string }> = {
    patient: { en: "Create Patient Account", kn: "Fungura Konti y'Umurwayi" },
    doctor: { en: "Create Doctor Account", kn: "Fungura Konti ya Muganga" },
    seeker: { en: "Create Health Seeker Account", kn: "Fungura Konti y'Ushaka Ubujyanama" },
  };

  const pageTitle = selectedRole && roleTitles[selectedRole] 
    ? currentT(roleTitles[selectedRole].en, roleTitles[selectedRole].kn) 
    : currentT("Create Account", "Fungura Konti");


  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page p-4">
         <p>{currentT("Redirecting to role selection...", "Koherezwa ku ihitamo ry'uruhare...")}</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page p-4">
      <Link href="/welcome" className="mb-8 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
        <LogoIcon className="h-8 w-8" />
        <span className="text-2xl font-bold font-headline">MediServe Hub</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{pageTitle}</CardTitle>
          <CardDescription>{currentT("Join MediServe Hub today. A (mock) verification code will be sent to your phone.", "Injira muri MediServe Hub uyu munsi. Kode y'igenzura (y'agateganyo) izoherezwa kuri telefone yawe.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{currentT("Full Name", "Amazina Yuzuye")}</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{currentT("Email Address", "Aderesi Email")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {currentT("Phone Number", "Nimero ya Telefone")}
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+250 7XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{currentT("Password", "Ijambobanga")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{currentT("Confirm Password", "Emeza Ijambobanga")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? currentT("Registering...", "Kwiyandikisha...") : currentT("Register", "Iyandikishe")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <p>
            {currentT("Already have an account?", "Usanzwe ufite konti?")}{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {currentT("Log in here", "Injira hano")}
            </Link>
          </p>
          <p>
            <Link href="/welcome" className="font-medium text-primary hover:underline">
              {currentT("Back to Role Selection", "Subira ku Ihitamo ry'Uruhare")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
