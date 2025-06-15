
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

const t = (enText: string, knText: string) => knText; // Defaulting to Kinyarwanda

const adminLoginSchema = z.object({
  username: z.string().min(3, { message: t("Izina ry'ukoresha rigomba kuba nibura inyuguti 3.", "Izina ry'ukoresha rigomba kuba nibura inyuguti 3.") }),
  password: z.string().min(6, { message: t("Ijambobanga rigomba kuba nibura inyuguti 6.", "Ijambobanga rigomba kuba nibura inyuguti 6.") }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    // This is a mock login. No data is persisted.
    // A real backend would verify credentials and return a session token.
    form.formState.isSubmitting = true;
    // Simulate API call
    // const response = await fetch('/api/auth/admin/login', { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} });
    // const result = await response.json();
    // if (response.ok) { /* Handle success */ } else { /* Handle error */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
    form.formState.isSubmitting = false;
    
    // MOCK CREDENTIALS FOR PROTOTYPE
    if (data.username === "admin@mediserve.com" && data.password === "AdminPassword123!") {
      toast({
        title: t("Kwinjira kw'Umunyamabanga Byagenze Neza", "Kwinjira kw'Umunyamabanga Byagenze Neza"),
        description: t("Murakaza neza, Munyamabanga! (Igerageza - Nta kwemeza nyakuri kwabaye)", "Murakaza neza, Munyamabanga! (Igerageza - Nta kwemeza nyakuri kwabaye)"),
      });
      // For prototype: Directly navigate. In real app, AppLayout's auth state
      // would be updated via context/global state after successful API login,
      // triggering redirects or component visibility changes.
      router.push('/admin/dashboard'); 
    } else {
      toast({
        variant: "destructive",
        title: t("Kwinjira kw'Umunyamabanga Byanze", "Kwinjira kw'Umunyamabanga Byanze"),
        description: t("Izina ry'ukoresha cyangwa ijambobanga ntabwo ari byo. Koresha 'admin@mediserve.com' / 'AdminPassword123!' ku bw'igerageza.", "Izina ry'ukoresha cyangwa ijambobanga ntabwo ari byo. Koresha 'admin@mediserve.com' / 'AdminPassword123!' ku bw'igerageza."),
      });
      form.setError("username", { type: "manual", message: " " });
      form.setError("password", { type: "manual", message: t("Izina ry'ukoresha cyangwa ijambobanga ntabwo ari byo.", "Izina ry'ukoresha cyangwa ijambobanga ntabwo ari byo.") });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background p-4">
      <Link href="/welcome" className="mb-8 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
        <LogoIcon className="h-8 w-8" />
        <span className="text-2xl font-bold font-headline">MediServe Hub</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{t("Kwinjira kw'Umunyamabanga", "Kwinjira kw'Umunyamabanga")}</CardTitle>
          <CardDescription>{t("Injira mu gice cy'ubuyobozi cya MediServe Hub. Igenzura ni iry'ikitegererezo gusa.", "Injira mu gice cy'ubuyobozi cya MediServe Hub. Igenzura ni iry'ikitegererezo gusa.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Izina ry'ukoresha (Email)", "Izina ry'ukoresha (Email)")}</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@mediserve.com" {...field} />
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
                      <Input type="password" placeholder="AdminPassword123!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("Kugenzura...", "Kugenzura...") : t("Injira nk'Umunyamabanga", "Injira nk'Umunyamabanga")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            {t("Ntabwo uri umunyamabanga?", "Ntabwo uri umunyamabanga?")}{' '}
            <Link href="/welcome" className="font-medium text-primary hover:underline">
              {t("Injira nk'Ukoresha / Hitamo Uruhare", "Injira nk'Ukoresha / Hitamo Uruhare")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

