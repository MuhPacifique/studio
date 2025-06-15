
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

const registerSchema = z.object({
  fullName: z.string().min(2, { message: t("Amazina yuzuye agomba kuba nibura inyuguti 2.", "Amazina yuzuye agomba kuba nibura inyuguti 2.") }),
  email: z.string().email({ message: t("Aderesi email yanditse nabi.", "Aderesi email yanditse nabi.") }),
  phone: z.string().min(10, { message: t("Nimero ya telefone igomba kuba nibura imibare 10.", "Nimero ya telefone igomba kuba nibura imibare 10.") }).regex(/^\+?[0-9\s-()]*$/, t("Uburyo bwanditsemo nimero ya telefone ntabwo ari bwo.", "Uburyo bwanditsemo nimero ya telefone ntabwo ari bwo.")),
  password: z.string().min(6, { message: t("Ijambobanga rigomba kuba nibura inyuguti 6.", "Ijambobanga rigomba kuba nibura inyuguti 6.") }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: t("Amagambobanga ntabwo ahura", "Amagambobanga ntabwo ahura"),
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roleFromQuery, setRoleFromQuery] = useState<string | null>(null);


  useEffect(() => {
    const role = searchParams.get('role');
    if (role && role !== 'admin') { 
      setRoleFromQuery(role);
    } else {
      toast({ variant: "destructive", title: t("Uruhare Rutemewe", "Uruhare Rutemewe"), description: t("Nyamuneka hitamo uruhare rwemewe mbere yo kwiyandikisha cyangwa admin ntiyiyandikisha hano.", "Nyamuneka hitamo uruhare rwemewe mbere yo kwiyandikisha cyangwa admin ntiyiyandikisha hano.") });
      router.replace('/welcome'); 
    }
  }, [searchParams, router, toast]);


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
    // This is a mock registration. No data is persisted.
    form.formState.isSubmitting = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    form.formState.isSubmitting = false;

    toast({
      title: t("Kwiyandikisha Byagenze Neza", "Kwiyandikisha Byagenze Neza"),
      description: `${t("Konti yawe ya", "Konti yawe ya")} ${roleFromQuery || 'user'} ${t("yafunguwe. Murakaza neza,", "yafunguwe. Murakaza neza,")} ${data.fullName}! (Igerageza)`,
    });
    // Redirect to login page for the selected role, conceptually.
    // A real app would likely auto-login or send to a verification step.
    router.push(`/login?role=${roleFromQuery}`); 
  };
  
  const roleTitles: Record<string, { en: string, kn: string }> = {
    patient: { en: "Create Patient Account", kn: "Fungura Konti y'Umurwayi" },
    doctor: { en: "Create Doctor Account", kn: "Fungura Konti ya Muganga" },
    seeker: { en: "Create Health Seeker Account", kn: "Fungura Konti y'Ushaka Ubujyanama" },
  };

  const pageTitle = roleFromQuery && roleTitles[roleFromQuery] 
    ? t(roleTitles[roleFromQuery].en, roleTitles[roleFromQuery].kn) 
    : t("Fungura Konti", "Fungura Konti");


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
          <CardDescription>{t("Injira muri MediServe Hub uyu munsi. Igenzura ni iry'ikitegererezo gusa.", "Injira muri MediServe Hub uyu munsi. Igenzura ni iry'ikitegererezo gusa.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Amazina Yuzuye", "Amazina Yuzuye")}</FormLabel>
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
                      {t("Nimero ya Telefone", "Nimero ya Telefone")}
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Emeza Ijambobanga", "Emeza Ijambobanga")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("Kwiyandikisha...", "Kwiyandikisha...") : t("Iyandikishe", "Iyandikishe")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <p>
            {t("Usanzwe ufite konti?", "Usanzwe ufite konti?")}{' '}
            <Link href={`/login?role=${roleFromQuery}`} className="font-medium text-primary hover:underline">
              {t("Injira hano", "Injira hano")}
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