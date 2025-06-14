
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Edit3, Save, Shield, Bell, FileText, Loader2, Palette, MessageCircle, MapPin, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  dob: z.string().optional(), 
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(200, "Bio must be 200 characters or less.").optional(),
  preferredLanguage: z.string().optional(),
  enableMarketingEmails: z.boolean().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [initials, setInitials] = useState("U");
  
  const [currentUser, setCurrentUser] = useState<ProfileFormValues>({
    fullName: "User Name",
    email: "user@example.com",
    phone: "",
    dob: "",
    address: "",
    city: "",
    country: "Rwanda",
    bio: "",
    preferredLanguage: "en",
    enableMarketingEmails: false,
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentUser,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const storedUserName = localStorage.getItem('mockUserName') || "Patty Patient";
      const storedUserEmail = localStorage.getItem('mockUserEmail') || "patient@example.com";

      if (!authStatus) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in to view your profile.",
        });
        router.replace('/login');
      } else {
        const userData: ProfileFormValues = {
          fullName: authStatus === 'admin' ? "Admin User" : storedUserName,
          email: authStatus === 'admin' ? "admin@mediservehub.com" : storedUserEmail,
          phone: localStorage.getItem('mockUserPhone') || "",
          dob: localStorage.getItem('mockUserDOB') || "",
          address: localStorage.getItem('mockUserAddress') || "",
          city: localStorage.getItem('mockUserCity') || "",
          country: localStorage.getItem('mockUserCountry') || "Rwanda",
          bio: localStorage.getItem('mockUserBio') || "Passionate about health and wellness.",
          preferredLanguage: localStorage.getItem('mockUserLang') || "en",
          enableMarketingEmails: localStorage.getItem('mockUserMarketing') === 'true',
          emergencyContactName: localStorage.getItem('mockUserEmergencyName') || "",
          emergencyContactPhone: localStorage.getItem('mockUserEmergencyPhone') || "",
        };
        setCurrentUser(userData);
        form.reset(userData); 

        const nameParts = userData.fullName.split(' ');
        const firstInitial = nameParts[0]?.[0] || '';
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
        setInitials((firstInitial + lastInitial).toUpperCase() || "U");
      }
    }
  }, [isClient, router, toast, form]);

  const onSubmit = (data: ProfileFormValues) => {
    setCurrentUser(data); 
    localStorage.setItem('mockUserName', data.fullName);
    localStorage.setItem('mockUserEmail', data.email);
    localStorage.setItem('mockUserPhone', data.phone || "");
    localStorage.setItem('mockUserDOB', data.dob || "");
    localStorage.setItem('mockUserAddress', data.address || "");
    localStorage.setItem('mockUserCity', data.city || "");
    localStorage.setItem('mockUserCountry', data.country || "Rwanda");
    localStorage.setItem('mockUserBio', data.bio || "");
    localStorage.setItem('mockUserLang', data.preferredLanguage || "en");
    localStorage.setItem('mockUserMarketing', String(data.enableMarketingEmails || false));
    localStorage.setItem('mockUserEmergencyName', data.emergencyContactName || "");
    localStorage.setItem('mockUserEmergencyPhone', data.emergencyContactPhone || "");


    const nameParts = data.fullName.split(' ');
    const firstInitial = nameParts[0]?.[0] || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
    setInitials((firstInitial + lastInitial).toUpperCase() || "U");

    toast({
      title: "Profile Updated (Mock)",
      description: "Your profile information has been saved.",
    });
  };

  if (!isClient || !localStorage.getItem('mockAuth')) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="My Profile" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Profile" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-xl hover-lift">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
                <AvatarImage src="https://placehold.co/100x100.png" alt={form.watch("fullName")} data-ai-hint="profile avatar professional" />
                <AvatarFallback className="text-3xl text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-headline gradient-text">{form.watch("fullName")}</CardTitle>
                <CardDescription className="text-md">{form.watch("email")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <Accordion type="multiple" defaultValue={['personal', 'contact']} className="w-full">
                  <AccordionItem value="personal" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <Briefcase className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> Basic Information
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address</FormLabel> <FormControl><Input type="email" {...field} readOnly={localStorage.getItem('mockAuth') !== 'admin'} /></FormControl> <FormMessage /> </FormItem> )} />
                      </div>
                      <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem> <FormLabel>Short Bio</FormLabel> <FormControl><Textarea placeholder="Tell us a bit about yourself..." {...field} rows={3} /></FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem> <FormLabel>Date of Birth</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="contact" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <MapPin className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> Contact & Address
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl><Input type="tel" placeholder="e.g., +250 7XX XXX XXX" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Street Address</FormLabel> <FormControl><Input placeholder="Kigali Heights, KG 7 Ave" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl><Input placeholder="Kigali" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>Country</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="preferences" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <Palette className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> Preferences
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                       <FormField control={form.control} name="preferredLanguage" render={({ field }) => ( <FormItem> <FormLabel>Preferred Language</FormLabel> <FormControl><Input placeholder="e.g., English, Kinyarwanda" {...field} /></FormControl> <FormDescription>We'll try to use this language where possible.</FormDescription> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="enableMarketingEmails" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5"> <FormLabel>Marketing Emails</FormLabel> <FormDescription>Receive updates on new features and promotions.</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                    </AccordionContent>
                  </AccordionItem>

                   <AccordionItem value="emergency" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <Shield className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> Emergency Contact
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="emergencyContactName" render={({ field }) => ( <FormItem> <FormLabel>Contact Name</FormLabel> <FormControl><Input placeholder="Full name of emergency contact" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => ( <FormItem> <FormLabel>Contact Phone</FormLabel> <FormControl><Input type="tel" placeholder="Phone number of emergency contact" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={form.formState.isSubmitting} className="transition-transform hover:scale-105 active:scale-95">
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Saving..." : "Save All Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xl hover-lift">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary"> <Shield className="mr-2 h-4 w-4" /> Change Password </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary"> <Bell className="mr-2 h-4 w-4" /> Notification Preferences </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary"> <FileText className="mr-2 h-4 w-4" /> My Medical Records (Mock) </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary"> <MessageCircle className="mr-2 h-4 w-4" /> Communication History </Button>
            </CardContent>
          </Card>
           <Card className="shadow-xl hover-lift border-destructive/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full justify-start text-left transition-opacity hover:opacity-80">
                <Edit3 className="mr-2 h-4 w-4" /> Deactivate Account (Mock)
              </Button>
               <p className="text-xs text-muted-foreground mt-2">This action is irreversible. Please be certain.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
