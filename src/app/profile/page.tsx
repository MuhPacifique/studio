
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

const profileSchema = (lang: 'en' | 'kn') => z.object({
  fullName: z.string().min(2, lang === 'kn' ? "Izina ryuzuye rigomba kuba nibura inyuguti 2." : "Full name must be at least 2 characters."),
  email: z.string().email(lang === 'kn' ? "Email yanditse nabi." : "Invalid email address."),
  phone: z.string().optional().refine(val => !val || /^(\+?250)?(07[2389])\d{7}$/.test(val), { message: lang === 'kn' ? "Nimero ya telefone y'u Rwanda yanditse nabi (urugero: 078xxxxxxx)." : "Invalid Rwandan phone number (e.g., 078xxxxxxx)." }),
  dob: z.string().optional().refine(val => {
    if (!val) return true; 
    const date = new Date(val);
    const year = date.getFullYear();
    return !isNaN(date.getTime()) && year > 1900 && year < new Date().getFullYear();
  }, { message: lang === 'kn' ? "Itariki y'amavuko yanditse nabi cyangwa umwaka uri hanze y'igihe." : "Invalid date of birth or year out of range."}), 
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(200, lang === 'kn' ? "Amagambo akuranga agomba kuba munsi y'inyuguti 200." : "Bio must be under 200 characters.").optional(),
  profileImageUrl: z.string().url({message: lang === 'kn' ? "URL y'ishusho yanditse nabi." : "Invalid image URL."}).optional().or(z.literal("")), 
  
  preferredLanguage: z.string().optional(),
  enableMarketingEmails: z.boolean().optional(),
  enableAppNotifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional().refine(val => !val || /^(\+?250)?(07[2389])\d{7}$/.test(val), { message: lang === 'kn' ? "Nimero ya telefone y'u Rwanda y'uwo guhamagara byihutirwa yanditse nabi." : "Invalid Rwandan emergency contact phone number." }),

  currentPassword: z.string().optional().refine(val => !val || val.length >= 6, { message: lang === 'kn' ? "Ijambobanga rigomba kuba nibura inyuguti 6." : "Password must be at least 6 characters."}),
  newPassword: z.string().optional().refine(val => !val || val.length >= 6, { message: lang === 'kn' ? "Ijambobanga rishya rigomba kuba nibura inyuguti 6." : "New password must be at least 6 characters."}),
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
    message: lang === 'kn' ? "Ijambobanga rishya ntirihura, ijambobanga rya none rirakenewe ngo uhindure, cyangwa kwemeza kurabuze." : "New passwords do not match, current password is required to change, or confirmation is missing.",
    path: ["confirmNewPassword"], 
});


type ProfileFormValues = z.infer<ReturnType<typeof profileSchema>>;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [initials, setInitials] = useState("U");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  
  const t = (enText: string, knText: string) => currentLanguage === 'kn' ? knText : enText;

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
    preferredLanguage: "kn",
    enableMarketingEmails: false,
    enableAppNotifications: true,
    theme: "system",
    emergencyContactName: "",
    emergencyContactPhone: "",
    enableTwoFactor: false,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema(currentLanguage)),
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
      const storedLang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;

      if(storedLang) setCurrentLanguage(storedLang);
      else {
        setCurrentLanguage('kn'); 
        localStorage.setItem('mockUserLang', 'kn');
      }

      if (!authStatus) {
        toast({
          variant: "destructive",
          title: t("Access Denied", "Ntabwo Wemerewe"),
          description: t("Please log in to view your profile.", "Nyamuneka injira kugirango ubashe kureba umwirondoro wawe."),
        });
        router.replace('/welcome'); 
      } else {
        const userData: ProfileFormValues = {
          fullName: authStatus === 'admin' ? t("Admin User", "Umunyamabanga Mukuru") : storedUserName,
          email: authStatus === 'admin' ? "admin@mediservehub.com" : storedUserEmail,
          phone: localStorage.getItem('mockUserPhone') || "0788123456",
          dob: localStorage.getItem('mockUserDOB') || "1990-01-01",
          address: localStorage.getItem('mockUserAddress') || "KG 123 St",
          city: localStorage.getItem('mockUserCity') || "Kigali",
          country: localStorage.getItem('mockUserCountry') || "Rwanda",
          bio: localStorage.getItem('mockUserBio') || t("Passionate about health and wellness. Exploring new ways to stay fit and informed.", "Nkunda cyane ubuzima bwiza n'imibereho myiza. Nshakisha uburyo bushya bwo kuguma mfite ubuzima bwiza kandi nzi amakuru."),
          profileImageUrl: storedProfileImage || "",
          preferredLanguage: storedLang || "kn",
          enableMarketingEmails: localStorage.getItem('mockUserMarketing') === 'true',
          enableAppNotifications: localStorage.getItem('mockUserAppNotifs') !== 'false', 
          theme: (localStorage.getItem('theme') as ProfileFormValues['theme']) || 'system',
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
  }, [isClient, router, toast, currentLanguage]); 

  useEffect(() => {
    form.reset({}, { keepValues: true, keepDirtyValues: true, keepErrors: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]); // Re-validate form on language change


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { 
        toast({ variant: "destructive", title: t("Image Too Large", "Ifoto ni Nini Cyane"), description: t("Please select an image smaller than 1MB.", "Nyamuneka hitamo ifoto iri munsi ya 1MB.")});
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
    if (updatedData.preferredLanguage) {
        localStorage.setItem('mockUserLang', updatedData.preferredLanguage);
        setCurrentLanguage(updatedData.preferredLanguage as 'en' | 'kn');
    }

    localStorage.setItem('mockUserMarketing', String(updatedData.enableMarketingEmails || false));
    localStorage.setItem('mockUserAppNotifs', String(updatedData.enableAppNotifications !== false));
    if (updatedData.theme) {
      localStorage.setItem('theme', updatedData.theme); 
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
    window.dispatchEvent(new StorageEvent('storage', { key: 'mockUserLang', newValue: updatedData.preferredLanguage }));


    toast({
      title: t("Profile Updated (Mock)", "Umwirondoro Wahinduwe (By'agateganyo)"),
      description: t("Your profile information has been saved to localStorage.", "Amakuru y'umwirondoro wawe yabitswe muri localStorage."),
    });
    form.reset(updatedData, { keepValues: false, keepDirty: false, keepDefaultValues: false }); 
    form.setValue('currentPassword',''); 
    form.setValue('newPassword','');
    form.setValue('confirmNewPassword','');
  };

  const handleMockAction = (actionName: string, actionNameKn: string) => {
    toast({
      title: t(`${actionName} (Mock)`, `${actionNameKn} (Agateganyo)`),
      description: t(`This feature (${actionName}) is not fully implemented yet.`, `Iki gice (${actionNameKn}) ntikirakora neza.`),
    });
  };


  if (!isClient || !localStorage.getItem('mockAuth')) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t('Loading profile...', 'Gutegura umwirondoro...')}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title={t("My Profile", "Umwirondoro Wanjye")} breadcrumbs={[{ label: t("Dashboard", "Imbonerahamwe"), href: "/" }, { label: t("Profile", "Umwirondoro") }]} />

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
                    aria-label={t("Change profile picture", "Hindura ifoto y'umwirondoro")}
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
                      <Label htmlFor="profileImageUrl-input" className="sr-only">{t("Profile Image URL", "URL y'Ifoto y'Umwirondoro")}</Label>
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
                       <Briefcase className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Basic Information", "Amakuru Shingiro")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>{t("Full Name", "Amazina Yuzuye")}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>{t("Email Address", "Aderesi Email")}</FormLabel> <FormControl><Input type="email" {...field} readOnly={localStorage.getItem('mockAuth') !== 'admin'} /></FormControl> <FormMessage /> </FormItem> )} />
                      </div>
                      <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem> <FormLabel>{t("Short Bio", "Amagambo make akuranga")}</FormLabel> <FormControl><Textarea placeholder={t("Tell us a bit about yourself...", "Tubwire bike kuri wowe...")} {...field} rows={3} /></FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem> <FormLabel>{t("Date of Birth", "Itariki y'Amavuko")}</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="contact" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <MapPin className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Contact & Address", "Aho Ubarizwa")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>{t("Phone Number", "Nimero ya Telefone")}</FormLabel> <FormControl><Input type="tel" placeholder={t("e.g., +250 7XX XXX XXX", "urugero: +250 7XX XXX XXX")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>{t("Street Address", "Aderesi y'Umuhanda")}</FormLabel> <FormControl><Input placeholder="Kigali Heights, KG 7 Ave" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>{t("City", "Umujyi")}</FormLabel> <FormControl><Input placeholder="Kigali" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>{t("Country", "Igihugu")}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="preferences" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <Palette className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Preferences", "Ibyo Uhitamo")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                       <FormField control={form.control} name="preferredLanguage" render={({ field }) => ( <FormItem> <FormLabel>{t("Preferred Language", "Ururimi Uhitamo")}</FormLabel> 
                         <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder={t("Select language", "Hitamo ururimi")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English (Icyongereza)</SelectItem>
                                    <SelectItem value="fr">French (Igifaransa)</SelectItem>
                                    <SelectItem value="kn">Kinyarwanda</SelectItem>
                                </SelectContent>
                            </Select>
                         </FormControl> 
                       <FormDescription>{t("We'll try to use this language where possible.", "Tuzagerageza gukoresha uru rurimi aho bishoboka.")}</FormDescription> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="theme" render={({ field }) => ( <FormItem> <FormLabel>{t("Theme", "Insanganyamatsiko")}</FormLabel> 
                         <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder={t("Select theme", "Hitamo insanganyamatsiko")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">{t("Light", "Urumuri")}</SelectItem>
                                    <SelectItem value="dark">{t("Dark", "Umwijima")}</SelectItem>
                                    <SelectItem value="system">{t("System Default", "Ibya Sisitemu")}</SelectItem>
                                </SelectContent>
                            </Select>
                         </FormControl> 
                       <FormDescription>{t("Choose your preferred application theme.", "Hitamo insanganyamatsiko y'ikoranabuhanga ukunda.")}</FormDescription> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="enableMarketingEmails" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>{t("Marketing Emails", "Email z'Ubucuruzi")}</FormLabel> <FormDescription>{t("Receive updates on new features and promotions.", "Yakira amakuru ku bishya n'amatangazo.")}</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="enableAppNotifications" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>{t("In-App Notifications", "Imenyesha ryo muri Porogaramu")}</FormLabel> <FormDescription>{t("Receive important alerts and updates within the app.", "Yakira amatangazo n'amakuru y'ingenzi muri porogaramu.")}</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                    </AccordionContent>
                  </AccordionItem>

                   <AccordionItem value="emergency" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <Shield className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Emergency Contact", "Uwo Guhamagara Byihutirwa")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="emergencyContactName" render={({ field }) => ( <FormItem> <FormLabel>{t("Contact Name", "Izina ry'Uwo Guhamagara")}</FormLabel> <FormControl><Input placeholder={t("Full name of emergency contact", "Amazina yuzuye y'uwo guhamagara byihutirwa")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => ( <FormItem> <FormLabel>{t("Contact Phone", "Telefone y'Uwo Guhamagara")}</FormLabel> <FormControl><Input type="tel" placeholder={t("Phone number of emergency contact", "Nimero ya telefone y'uwo guhamagara byihutirwa")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="securitySettings" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <LockKeyhole className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Security Settings", "Igenamiterere ry'Umutekano")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="currentPassword" render={({ field }) => ( <FormItem> <FormLabel>{t("Current Password", "Ijambobanga rya None")}</FormLabel> <FormControl><Input type="password" placeholder={t("Enter current password", "Shyiramo ijambobanga rya none")} {...field} /></FormControl> <FormDescription>{t("Required to set a new password.", "Rirakenewe kugirango ushyireho ijambobanga rishya.")}</FormDescription> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="newPassword" render={({ field }) => ( <FormItem> <FormLabel>{t("New Password", "Ijambobanga Rishya")}</FormLabel> <FormControl><Input type="password" placeholder={t("Enter new password", "Shyiramo ijambobanga rishya")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="confirmNewPassword" render={({ field }) => ( <FormItem> <FormLabel>{t("Confirm New Password", "Emeza Ijambobanga Rishya")}</FormLabel> <FormControl><Input type="password" placeholder={t("Confirm new password", "Emeza ijambobanga rishya")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="enableTwoFactor" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>{t("Two-Factor Authentication", "Kwemeza mu Byiciro Bibiri")}</FormLabel> <FormDescription>{t("Enhance your account security (Mock).", "Ongera umutekano wa konti yawe (By'agateganyo).")}</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
                
                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty} className="transition-transform hover:scale-105 active:scale-95 py-3 px-6 text-base">
                    <Save className="mr-2 h-5 w-5" />
                    {form.formState.isSubmitting ? t("Saving...", "Kubika...") : t("Save All Changes", "Bika Impinduka Zose")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xl hover-lift dark:shadow-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-lg">{t("Account Actions", "Ibikorwa bya Konti")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("My Medical Records", "Amadosiye Yanjye y'Ubuvuzi")}> <FileText className="mr-2 h-4 w-4" /> {t("My Medical Records (Mock)", "Amadosiye Yanjye y'Ubuvuzi (Agateganyo)")} </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("My Order History", "Amateka y'Ibyo Natumije")}> <FileClock className="mr-2 h-4 w-4" /> {t("My Order History (Mock)", "Amateka y'Ibyo Natumije (Agateganyo)")} </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("Login History", "Amateka y'Uko Ninjiye")}> <History className="mr-2 h-4 w-4" /> {t("Login History (Mock)", "Amateka y'Uko Ninjiye (Agateganyo)")} </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("Communication History", "Amateka y'Itumanaho")}> <MessageCircle className="mr-2 h-4 w-4" /> {t("Communication History", "Amateka y'Itumanaho")} </Button>
            </CardContent>
          </Card>
           <Card className="shadow-xl hover-lift border-destructive/30 dark:border-destructive/50 dark:shadow-destructive/10">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-destructive">{t("Data & Privacy", "Amakuru & Ubuzima Bwite")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-destructive hover:text-destructive/80 hover:bg-destructive/5 hover-lift" onClick={() => handleMockAction("Export My Data", "Ohereza Amakuru Yanjye")}><Database className="mr-2 h-4 w-4"/> {t("Export My Data (Mock)", "Ohereza Amakuru Yanjye (Agateganyo)")}</Button>
              <Button variant="destructive" className="w-full justify-start text-left transition-opacity hover:opacity-90 hover-lift" onClick={() => handleMockAction("Deactivate Account", "Hagarika Konti")}>
                <PowerOff className="mr-2 h-4 w-4" /> {t("Deactivate Account (Mock)", "Hagarika Konti (Agateganyo)")}
              </Button>
               <p className="text-xs text-muted-foreground mt-2">{t("Deactivating your account is irreversible. Please be certain.", "Guhagarika konti yawe ntibisubirwaho. Nyamuneka wizere.")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
