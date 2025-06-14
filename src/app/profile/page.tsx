
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3, Save, Shield, Bell, FileText, Loader2, Palette, MessageCircle, MapPin, Briefcase, KeyRound, Database, LockKeyhole, History, FileClock, Camera, PowerOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional().refine(val => !val || /^(\+?250)?(07[2389])\d{7}$/.test(val), { message: "Invalid Rwandan phone number if provided (e.g., 078xxxxxxx or +25078xxxxxxx)." }),
  dob: z.string().optional().refine(val => {
    if (!val) return true; // Optional, so empty is fine
    const date = new Date(val);
    const year = date.getFullYear();
    return !isNaN(date.getTime()) && year > 1900 && year < new Date().getFullYear();
  }, { message: "Invalid date or year out of range."}), 
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(200, "Bio must be 200 characters or less.").optional(),
  profileImageUrl: z.string().url({message: "Invalid URL format."}).optional().or(z.literal("")), 
  
  preferredLanguage: z.string().optional(),
  enableMarketingEmails: z.boolean().optional(),
  enableAppNotifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional().refine(val => !val || /^(\+?250)?(07[2389])\d{7}$/.test(val), { message: "Invalid Rwandan phone number for emergency contact." }),

  currentPassword: z.string().optional().refine(val => !val || val.length >= 6, { message: "Password must be at least 6 characters."}),
  newPassword: z.string().optional().refine(val => !val || val.length >= 6, { message: "New password must be at least 6 characters."}),
  confirmNewPassword: z.string().optional(),
  enableTwoFactor: z.boolean().optional(),
}).refine(data => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    if (data.newPassword && !data.confirmNewPassword) {
        return false; 
    }
    if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
        return false;
    }
    return true;
}, {
    message: "New passwords do not match, current password is required for change, or confirmation is missing.",
    path: ["confirmNewPassword"], 
});


type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [initials, setInitials] = useState("U");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUser, setCurrentUser] = useState<ProfileFormValues>({
    fullName: "User Name",
    email: "user@example.com",
    phone: "",
    dob: "",
    address: "",
    city: "",
    country: "Rwanda",
    bio: "",
    profileImageUrl: "",
    preferredLanguage: "en",
    enableMarketingEmails: false,
    enableAppNotifications: true,
    theme: "system",
    emergencyContactName: "",
    emergencyContactPhone: "",
    enableTwoFactor: false,
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
      const storedProfileImage = localStorage.getItem('mockUserProfileImage');

      if (!authStatus) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in to view your profile.",
        });
        router.replace('/welcome'); 
      } else {
        const userData: ProfileFormValues = {
          fullName: authStatus === 'admin' ? "Admin User" : storedUserName,
          email: authStatus === 'admin' ? "admin@mediservehub.com" : storedUserEmail,
          phone: localStorage.getItem('mockUserPhone') || "0788123456",
          dob: localStorage.getItem('mockUserDOB') || "1990-01-01",
          address: localStorage.getItem('mockUserAddress') || "KG 123 St",
          city: localStorage.getItem('mockUserCity') || "Kigali",
          country: localStorage.getItem('mockUserCountry') || "Rwanda",
          bio: localStorage.getItem('mockUserBio') || "Passionate about health and wellness. Exploring new ways to stay fit and informed.",
          profileImageUrl: storedProfileImage || "",
          preferredLanguage: localStorage.getItem('mockUserLang') || "en",
          enableMarketingEmails: localStorage.getItem('mockUserMarketing') === 'true',
          enableAppNotifications: localStorage.getItem('mockUserAppNotifs') !== 'false', 
          theme: (localStorage.getItem('theme') as ProfileFormValues['theme']) || 'system', // Read from 'theme' not 'mockUserTheme'
          emergencyContactName: localStorage.getItem('mockUserEmergencyName') || "Jane Doe",
          emergencyContactPhone: localStorage.getItem('mockUserEmergencyPhone') || "0788654321",
          enableTwoFactor: localStorage.getItem('mockUser2FA') === 'true',
        };
        setCurrentUser(userData);
        form.reset(userData); 
        if(userData.profileImageUrl) setImagePreview(userData.profileImageUrl);

        const nameParts = userData.fullName.split(' ');
        const firstInitial = nameParts[0]?.[0] || '';
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
        setInitials((firstInitial + lastInitial).toUpperCase() || "U");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, router, toast]); // form removed from deps to avoid re-setting on every render

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({ variant: "destructive", title: "Image Too Large", description: "Please select an image smaller than 1MB."});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("profileImageUrl", result, { shouldValidate: true, shouldDirty: true }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    const updatedProfileImageUrl = imagePreview || data.profileImageUrl || "";
    const updatedData: ProfileFormValues = { ...data, profileImageUrl: updatedProfileImageUrl };
    
    setCurrentUser(updatedData); 

    localStorage.setItem('mockUserName', updatedData.fullName);
    localStorage.setItem('mockUserEmail', updatedData.email);
    localStorage.setItem('mockUserPhone', updatedData.phone || "");
    localStorage.setItem('mockUserDOB', updatedData.dob || "");
    localStorage.setItem('mockUserAddress', updatedData.address || "");
    localStorage.setItem('mockUserCity', updatedData.city || "");
    localStorage.setItem('mockUserCountry', updatedData.country || "Rwanda");
    localStorage.setItem('mockUserBio', updatedData.bio || "");
    localStorage.setItem('mockUserProfileImage', updatedProfileImageUrl); 

    localStorage.setItem('mockUserLang', updatedData.preferredLanguage || "en");
    localStorage.setItem('mockUserMarketing', String(updatedData.enableMarketingEmails || false));
    localStorage.setItem('mockUserAppNotifs', String(updatedData.enableAppNotifications !== false));
    if (updatedData.theme) {
      localStorage.setItem('theme', updatedData.theme); // Save theme preference
      document.documentElement.classList.remove('light', 'dark');
      if (updatedData.theme === 'dark') document.documentElement.classList.add('dark');
      else if (updatedData.theme === 'light') document.documentElement.classList.add('light');
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');

    }
    localStorage.setItem('mockUserEmergencyName', updatedData.emergencyContactName || "");
    localStorage.setItem('mockUserEmergencyPhone', updatedData.emergencyContactPhone || "");
    localStorage.setItem('mockUser2FA', String(updatedData.enableTwoFactor || false));

    const nameParts = updatedData.fullName.split(' ');
    const firstInitial = nameParts[0]?.[0] || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
    setInitials((firstInitial + lastInitial).toUpperCase() || "U");

    window.dispatchEvent(new StorageEvent('storage', { key: 'mockUserProfileImage', newValue: updatedProfileImageUrl }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'mockUserName', newValue: updatedData.fullName }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: updatedData.theme }));


    toast({
      title: "Profile Updated (Mock)",
      description: "Your profile information has been saved to localStorage.",
    });
    form.reset(updatedData, { keepValues: false, keepDirty: false, keepDefaultValues: false }); 
    form.setValue('currentPassword',''); // Clear password fields
    form.setValue('newPassword','');
    form.setValue('confirmNewPassword','');
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
        <Card className="lg:col-span-2 shadow-xl hover-lift dark:shadow-primary/10">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={imagePreview || form.watch("profileImageUrl") || undefined} alt={form.watch("fullName")} data-ai-hint="person professional"/>
                  <AvatarFallback className="text-4xl text-primary font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 ease-in-out hover:scale-110"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Change profile picture"
                >
                    <Camera className="h-4 w-4"/>
                </Button>
                <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif" 
                    onChange={handleImageChange}
                />
                 <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem className="w-full hidden"> 
                      <Label htmlFor="profileImageUrl-input" className="sr-only">Profile Image URL</Label>
                      <Input id="profileImageUrl-input" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-headline gradient-text">{form.watch("fullName")}</CardTitle>
                <CardDescription className="text-md text-muted-foreground">{form.watch("email")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <Accordion type="multiple" defaultValue={['personal', 'preferences']} className="w-full">
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
                       <FormField control={form.control} name="preferredLanguage" render={({ field }) => ( <FormItem> <FormLabel>Preferred Language</FormLabel> 
                         <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="kin">Kinyarwanda</SelectItem>
                                </SelectContent>
                            </Select>
                         </FormControl> 
                       <FormDescription>We'll try to use this language where possible.</FormDescription> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="theme" render={({ field }) => ( <FormItem> <FormLabel>Theme</FormLabel> 
                         <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System Default</SelectItem>
                                </SelectContent>
                            </Select>
                         </FormControl> 
                       <FormDescription>Choose your preferred application theme.</FormDescription> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="enableMarketingEmails" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>Marketing Emails</FormLabel> <FormDescription>Receive updates on new features and promotions.</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="enableAppNotifications" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>In-App Notifications</FormLabel> <FormDescription>Receive important alerts and updates within the app.</FormDescription> </div>
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

                  <AccordionItem value="securitySettings" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <LockKeyhole className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> Security Settings
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="currentPassword" render={({ field }) => ( <FormItem> <FormLabel>Current Password</FormLabel> <FormControl><Input type="password" placeholder="Enter current password" {...field} /></FormControl> <FormDescription>Required to set a new password.</FormDescription> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="newPassword" render={({ field }) => ( <FormItem> <FormLabel>New Password</FormLabel> <FormControl><Input type="password" placeholder="Enter new password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="confirmNewPassword" render={({ field }) => ( <FormItem> <FormLabel>Confirm New Password</FormLabel> <FormControl><Input type="password" placeholder="Confirm new password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="enableTwoFactor" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>Two-Factor Authentication</FormLabel> <FormDescription>Enhance your account security (Mock).</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
                
                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty} className="transition-transform hover:scale-105 active:scale-95 py-3 px-6 text-base">
                    <Save className="mr-2 h-5 w-5" />
                    {form.formState.isSubmitting ? "Saving..." : "Save All Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xl hover-lift dark:shadow-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift"> <FileText className="mr-2 h-4 w-4" /> My Medical Records (Mock) </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift"> <FileClock className="mr-2 h-4 w-4" /> My Order History (Mock) </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift"> <History className="mr-2 h-4 w-4" /> Login History (Mock) </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift"> <MessageCircle className="mr-2 h-4 w-4" /> Communication History </Button>
            </CardContent>
          </Card>
           <Card className="shadow-xl hover-lift border-destructive/30 dark:border-destructive/50 dark:shadow-destructive/10">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-destructive">Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-destructive hover:text-destructive/80 hover:bg-destructive/5 hover-lift"><Database className="mr-2 h-4 w-4"/> Export My Data (Mock)</Button>
              <Button variant="destructive" className="w-full justify-start text-left transition-opacity hover:opacity-90 hover-lift">
                <PowerOff className="mr-2 h-4 w-4" /> Deactivate Account (Mock)
              </Button>
               <p className="text-xs text-muted-foreground mt-2">Deactivating your account is irreversible. Please be certain.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
