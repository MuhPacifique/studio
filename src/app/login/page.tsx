
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
import { useRouter, useSearchParams } from 'next/navigation'; 
import { Phone } from 'lucide-react';

const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda

const loginSchema = z.object({
  email: z.string().email({ message: t("Aderesi email yanditse nabi.", "Aderesi email yanditse nabi.") }),
  phone: z.string().optional().refine(val => !val || val.length >= 10, { message: t("Nimero ya telefone igomba kuba nibura imibare 10 niba yatanzwe.", "Nimero ya telefone igomba kuba nibura imibare 10 niba yatanzwe.")}),
  password: z.string().min(6, { message: t("Ijambobanga rigomba kuba nibura inyuguti 6.", "Ijambobanga rigomba kuba nibura inyuguti 6.") }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const [roleFromQuery, setRoleFromQuery] = useState<string | null>(null);

  useEffect(() => {
    const role = searchParams.get('role');
    if (role) {
      setRoleFromQuery(role);
    } else {
      // If no role in query, redirect to welcome, as role selection is now transient
      router.replace('/welcome');
    }
  }, [searchParams, router]);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // This is a mock login. No data is persisted.
    form.formState.isSubmitting = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    form.formState.isSubmitting = false;
    
    let loginSuccess = false;
    let userName = t("Umukoresha", "Umukoresha"); 
    let redirectPath = '/'; // Default redirect path after successful "login"

    // Mock credentials check - THIS DOES NOT USE REAL AUTHENTICATION
    if (roleFromQuery === 'doctor' && data.email === "doctor@example.com" && data.password === "password") {
        loginSuccess = true;
        userName = t("Dr. Alex Smith", "Dr. Alex Smith"); 
        redirectPath = '/doctor/dashboard';
    } else if (roleFromQuery === 'patient' && data.email === "patient@example.com" && data.password === "password") {
        loginSuccess = true;
        userName = t("Patty Patient", "Patty Patient");
        // For patient, redirectPath remains '/' which will be handled by AppLayout
    } else if (roleFromQuery === 'seeker' && data.email === "seeker@example.com" && data.password === "password") {
        loginSuccess = true;
        userName = t("Sam Seeker", "Sam Seeker");
    }

    if (loginSuccess) {
      toast({
        title: t("Kwinjira Byagenze Neza", "Kwinjira Byagenze Neza"),
        description: `${t("Murakaza neza", "Murakaza neza")}, ${userName}! (Igerageza)`,
      });
      // For prototype, simulate "logging in" by redirecting.
      // AppLayout's mock auth state isn't directly changed here,
      // as a real app would get session info from backend response.
      // To test authenticated views, manually set `isAuthenticated` to true in AppLayout.
      router.push(redirectPath); 
    } else {
      toast({
        variant: "destructive",
        title: t("Kwinjira Byanze", "Kwinjira Byanze"),
        description: t("Amakuru watanze ntabwo ariyo kuri uru ruhare rwahiswemo cyangwa ni ay'ikitegererezo gusa.", "Amakuru watanze ntabwo ariyo kuri uru ruhare rwahiswemo cyangwa ni ay'ikitegererezo gusa."),
      });
      form.setError("email", { type: "manual", message: " " }); 
      form.setError("password", { type: "manual", message: t("Amakuru watanze ntabwo ariyo.", "Amakuru watanze ntabwo ariyo.") });
    }
  };
  
  const roleTitles: Record<string, { en: string, kn: string }> = {
    patient: { en: "Patient Login", kn: "Kwinjira kw'Umurwayi" },
    doctor: { en: "Doctor Login", kn: "Kwinjira kwa Muganga" },
    seeker: { en: "Health Seeker Login", kn: "Kwinjira k'Ushaka Ubujyanama" },
  };

  const pageTitle = roleFromQuery && roleTitles[roleFromQuery] 
    ? t(roleTitles[roleFromQuery].en, roleTitles[roleFromQuery].kn) 
    : t("Injira", "Injira");

  if (!roleFromQuery) {
    return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page p-4">
            <p>{t("Gutegura...", "Gutegura...")}</p> 
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
          <CardDescription>{t("Injira muri konti yawe ya MediServe Hub. Igenzura ni iry'ikitegererezo gusa.", "Injira muri konti yawe ya MediServe Hub. Igenzura ni iry'ikitegererezo gusa.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Aderesi Email", "Aderesi Email")}</FormLabel>
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
                      {t("Nimero ya Telefone (Si ngombwa kwinjira)", "Nimero ya Telefone (Si ngombwa kwinjira)")}
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
                    <FormLabel>{t("Ijambobanga", "Ijambobanga")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("Kwinjira...", "Kwinjira...") : t("Injira", "Injira")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <p>
            {t("Ukeneye konti?", "Ukeneye konti?")}{' '}
            <Link href={`/register?role=${roleFromQuery}`} className="font-medium text-primary hover:underline">
              {t("Iyandikishe hano", "Iyandikishe hano")}
            </Link>
          </p>
           <p>
            <Link href="/welcome" className="font-medium text-primary hover:underline">
              {t("Subira ku Ihitamo ry'Uruhare", "Subira ku Ihitamo ry'Uruhare")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
```