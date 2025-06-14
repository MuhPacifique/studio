
"use client";

import React, { useState, useEffect } from 'react';
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

const preferredLanguage = typeof window !== 'undefined' ? (localStorage.getItem('mockUserLang') as 'en' | 'kn' || 'kn') : 'kn';
const t = (enText: string, knText: string) => preferredLanguage === 'kn' ? knText : enText;


const adminLoginSchema = z.object({
  username: z.string().min(3, { message: t("Username must be at least 3 characters.", "Izina ry'ukoresha rigomba kuba nibura inyuguti 3.") }),
  password: z.string().min(6, { message: t("Password must be at least 6 characters.", "Ijambobanga rigomba kuba nibura inyuguti 6.") }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  useEffect(() => {
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);

  const currentT = (enText: string, knText: string) => currentLanguage === 'kn' ? knText : enText;

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.username === "reponsekdz06@gmail.com" && data.password === "20072025") {
      toast({
        title: currentT("Admin Login Successful", "Kwinjira kw'Umunyamabanga Byagenze Neza"),
        description: currentT("Welcome, Administrator!", "Murakaza neza, Munyamabanga!"),
      });
      localStorage.setItem('mockAuth', 'admin'); 
      localStorage.setItem('selectedRole', 'admin');
      localStorage.setItem('mockUserName', "Admin User");
      localStorage.setItem('mockUserEmail', data.username);
      router.push('/admin/dashboard'); 
    } else {
      toast({
        variant: "destructive",
        title: currentT("Admin Login Failed", "Kwinjira kw'Umunyamabanga Byanze"),
        description: currentT("Invalid username or password.", "Izina ry'ukoresha cyangwa ijambobanga ntabwo ari byo."),
      });
      form.setError("username", { type: "manual", message: " " });
      form.setError("password", { type: "manual", message: currentT("Invalid username or password.", "Izina ry'ukoresha cyangwa ijambobanga ntabwo ari byo.") });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background p-4">
      <Link href="/" className="mb-8 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
        <LogoIcon className="h-8 w-8" />
        <span className="text-2xl font-bold font-headline">MediServe Hub</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{currentT("Administrator Login", "Kwinjira kw'Umunyamabanga")}</CardTitle>
          <CardDescription>{currentT("Access the MediServe Hub admin panel.", "Injira mu gice cy'ubuyobozi cya MediServe Hub.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{currentT("Username (Email)", "Izina ry'ukoresha (Email)")}</FormLabel>
                    <FormControl>
                      <Input placeholder="your.admin.email@example.com" {...field} />
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
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? currentT("Authenticating...", "Kugenzura...") : currentT("Log In as Admin", "Injira nk'Umunyamabanga")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            {currentT("Not an admin?", "Ntabwo uri umunyamabanga?")}{' '}
            <Link href="/welcome" className="font-medium text-primary hover:underline">
              {currentT("User Login/Selection", "Injira nk'Ukoresha / Hitamo Uruhare")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
