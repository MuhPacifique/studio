
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3, Save, Shield, Bell, FileText, Loader2, Palette, MessageCircle, MapPin, Briefcase, KeyRound, Database, LockKeyhole, History, FileClock, Camera, PowerOff, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const t = (enText: string, knText: string) => knText; 

const profileSchema = z.object({
  fullName: z.string().min(2, t("Izina ryuzuye rigomba kuba nibura inyuguti 2.", "Izina ryuzuye rigomba kuba nibura inyuguti 2.")),
  email: z.string().email(t("Email yanditse nabi.", "Email yanditse nabi.")),
  phone: z.string().optional().refine(val => !val || /^(\+?250)?(07[2389])\d{7}$/.test(val), { message: t("Nimero ya telefone y'u Rwanda yanditse nabi (urugero: 078xxxxxxx).", "Nimero ya telefone y'u Rwanda yanditse nabi (urugero: 078xxxxxxx).") }),
  dob: z.string().optional().refine(val => {
    if (!val) return true; 
    const date = new Date(val);
    const year = date.getFullYear();
    return !isNaN(date.getTime()) && year > 1900 && year < new Date().getFullYear();
  }, { message: t("Itariki y'amavuko yanditse nabi cyangwa umwaka uri hanze y'igihe.", "Itariki y'amavuko yanditse nabi cyangwa umwaka uri hanze y'igihe.")}), 
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(200, t("Amagambo akuranga agomba kuba munsi y'inyuguti 200.", "Amagambo akuranga agomba kuba munsi y'inyuguti 200.")).optional(),
  profileImageUrl: z.string().url({message: t("URL y'ishusho yanditse nabi.", "URL y'ishusho yanditse nabi.")}).optional().or(z.literal("")), 
  
  preferredLanguage: z.string().optional(),
  enableMarketingEmails: z.boolean().optional(),
  enableAppNotifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional().refine(val => !val || /^(\+?250)?(07[2389])\d{7}$/.test(val), { message: t("Nimero ya telefone y'u Rwanda y'uwo guhamagara byihutirwa yanditse nabi.", "Nimero ya telefone y'u Rwanda y'uwo guhamagara byihutirwa yanditse nabi.") }),

  currentPassword: z.string().optional().refine(val => !val || val.length >= 6, { message: t("Ijambobanga rigomba kuba nibura inyuguti 6.", "Ijambobanga rigomba kuba nibura inyuguti 6.")}),
  newPassword: z.string().optional().refine(val => !val || val.length >= 6, { message: t("Ijambobanga rishya rigomba kuba nibura inyuguti 6.", "Ijambobanga rishya rigomba kuba nibura inyuguti 6.")}),
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
    message: t("Ijambobanga rishya ntirihura, ijambobanga rya none rirakenewe ngo uhindure, cyangwa kwemeza kurabuze.", "Ijambobanga rishya ntirihura, ijambobanga rya none rirakenewe ngo uhindure, cyangwa kwemeza kurabuze."),
    path: ["confirmNewPassword"], 
});


type ProfileFormValues = z.infer<ReturnType<typeof profileSchema>>;

export default function ProfilePage() {
  const router = useRouter(); // Kept for potential future use
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [initials, setInitials] = useState("U");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Default user data. In a real app, this would be fetched from the backend after authentication.
  // This data is now ephemeral and resets on page load.
  const defaultUserData: ProfileFormValues = {
    fullName: t("Ntwari Jean", "Ntwari Jean"),
    email: "ntwari.jean@example.rw", // This should be non-editable or fetched from an auth context
    phone: "0788123456",
    dob: "1990-01-01",
    address: "KG 123 St",
    city: "Kigali",
    country: "Rwanda",
    bio: t("Passionate about health and wellness.", "Nkunda cyane ubuzima bwiza n'imibereho myiza."),
    profileImageUrl: "", // Placeholder, user can upload
    preferredLanguage: "kn",
    enableMarketingEmails: false,
    enableAppNotifications: true,
    theme: "system",
    emergencyContactName: "Mukamana Alice",
    emergencyContactPhone: "0788654321",
    enableTwoFactor: false,
  };
  
  const [currentUser, setCurrentUser] = useState<ProfileFormValues>(defaultUserData);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultUserData, 
  });

  useEffect(() => {
    setIsClient(true);
    // Data is now initialized from defaultUserData, not localStorage
    form.reset(defaultUserData);
    if(defaultUserData.profileImageUrl) setImagePreview(defaultUserData.profileImageUrl);
    updateInitials(defaultUserData.fullName);
    
    // Set theme and language from current state, as localStorage is gone
    document.documentElement.lang = defaultUserData.preferredLanguage || 'kn';
    document.documentElement.classList.remove('light', 'dark');
    if (defaultUserData.theme === 'dark') document.documentElement.classList.add('dark');
    else if (defaultUserData.theme === 'light') document.documentElement.classList.remove('dark');
    else if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
        
    setIsLoadingData(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const updateInitials = (fullName: string) => {
    const nameParts = fullName.split(' ');
    const firstInitial = nameParts[0]?.[0] || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
    setInitials((firstInitial + lastInitial).toUpperCase() || "U");
  };

  const handleLanguageChange = (langValue: string | undefined) => {
    if (langValue && (langValue === 'en' || langValue === 'kn' || langValue === 'fr')) {
      form.setValue("preferredLanguage", langValue, { shouldDirty: true, shouldValidate: true });
      document.documentElement.lang = langValue; 
      toast({ description: t(`Ururimi rwahinduwe ${langValue}. (Ibi ntibizabikwa muri iyi prototype)`, `Ururimi rwahinduwe ${langValue}. (Ibi ntibizabikwa muri iyi prototype)`) });
    }
  };

  const handleThemeChange = (themeValue: string | undefined) => {
    if (themeValue && (themeValue === 'light' || themeValue === 'dark' || themeValue === 'system')) {
      form.setValue("theme", themeValue as 'light' | 'dark' | 'system', { shouldDirty: true, shouldValidate: true });
      document.documentElement.classList.remove('light', 'dark');
      if (themeValue === 'dark') document.documentElement.classList.add('dark');
      else if (themeValue === 'light') document.documentElement.classList.remove('dark'); 
      else if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      toast({ description: t(`Insanganyamatsiko yahinduwe ${themeValue}. (Ibi ntibizabikwa muri iyi prototype)`, `Insanganyamatsiko yahinduwe ${themeValue}. (Ibi ntibizabikwa muri iyi prototype)`) });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { 
        toast({ variant: "destructive", title: t("Ifoto ni Nini Cyane", "Ifoto ni Nini Cyane"), description: t("Nyamuneka hitamo ifoto iri munsi ya 1MB.", "Nyamuneka hitamo ifoto iri munsi ya 1MB.")});
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

  const onSubmit = async (data: ProfileFormValues) => {
    // In a real app, this would send data to the backend.
    // For this prototype, the data change is ephemeral.
    const updatedProfileImageUrl = imagePreview || data.profileImageUrl || "";
    const dataToSave: ProfileFormValues = { ...data, profileImageUrl: updatedProfileImageUrl };
    
    form.formState.isSubmitting = true; 
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    form.formState.isSubmitting = false;

    setCurrentUser(dataToSave); // Update local state (ephemeral)
    updateInitials(dataToSave.fullName);

    toast({
      title: t("Umwirondoro Wahinduwe (Igerageza)", "Umwirondoro Wahinduwe (Igerageza)"),
      description: t("Amakuru y'umwirondoro wawe yoherejwe kuri seriveri (mu buryo bw'ikitegererezo). Ntazabikwa muri iyi prototype nyuma yo guhindura paji.", "Amakuru y'umwirondoro wawe yoherejwe kuri seriveri (mu buryo bw'ikitegererezo). Ntazabikwa muri iyi prototype nyuma yo guhindura paji."),
    });
    form.reset(dataToSave); 
    form.setValue('currentPassword',''); 
    form.setValue('newPassword','');
    form.setValue('confirmNewPassword','');
  };

  const handleMockAction = (actionName: string, actionNameKn: string) => {
    toast({
      title: t(`${actionName} (Igerageza)`, `${actionNameKn} (Igerageza)`),
      description: t(`Iki gice (${actionNameKn}) ntikirakora neza. Gisaba guhuzwa na seriveri kugirango kibike amakuru.`, `Iki gice (${actionNameKn}) ntikirakora neza. Gisaba guhuzwa na seriveri kugirango kibike amakuru.`),
    });
  };

  if (!isClient || isLoadingData) { 
    return (
      <AppLayout>
         <PageHeader title={t("Umwirondoro Wanjye", "Umwirondoro Wanjye")} />
        <div className="flex flex-col justify-center items-center h-auto py-10 bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t('Gutegura umwirondoro...', 'Gutegura umwirondoro...')}</p>
        </div>
      </AppLayout>
    );
  }
  
  // AppLayout handles redirect if not authenticated.
  // Assuming if user is here, they are "authenticated" for prototype purposes.

  return (
    <AppLayout>
      <PageHeader title={t("Umwirondoro Wanjye", "Umwirondoro Wanjye")} breadcrumbs={[{ label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/" }, { label: t("Umwirondoro", "Umwirondoro") }]} />
      <FormProvider {...form}>
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
                    type="button"
                    className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 ease-in-out hover:scale-110"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label={t("Hindura ifoto y'umwirondoro", "Hindura ifoto y'umwirondoro")}
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
                      <FormLabel htmlFor="profileImageUrl-input" className="sr-only">{t("URL y'Ifoto y'Umwirondoro", "URL y'Ifoto y'Umwirondoro")}</FormLabel>
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
                       <Briefcase className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Amakuru Shingiro", "Amakuru Shingiro")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>{t("Amazina Yuzuye", "Amazina Yuzuye")}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>{t("Aderesi Email", "Aderesi Email")}</FormLabel> <FormControl><Input type="email" {...field} disabled /></FormControl> <FormDescription>{t("Email ntishobora guhindurwa (byagenzurwa na seriveri).", "Email ntishobora guhindurwa (byagenzurwa na seriveri).")}</FormDescription><FormMessage /> </FormItem> )} />
                      </div>
                      <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem> <FormLabel>{t("Amagambo make akuranga", "Amagambo make akuranga")}</FormLabel> <FormControl><Textarea placeholder={t("Tubwire bike kuri wowe...", "Tubwire bike kuri wowe...")} {...field} rows={3} /></FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem> <FormLabel>{t("Itariki y'Amavuko", "Itariki y'Amavuko")}</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="contact" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <MapPin className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Aho Ubarizwa", "Aho Ubarizwa")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>{t("Nimero ya Telefone", "Nimero ya Telefone")}</FormLabel> <FormControl><Input type="tel" placeholder={t("urugero: 078xxxxxxx", "urugero: 078xxxxxxx")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>{t("Aderesi y'Umuhanda", "Aderesi y'Umuhanda")}</FormLabel> <FormControl><Input placeholder="Kigali Heights, KG 7 Ave" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>{t("Umujyi", "Umujyi")}</FormLabel> <FormControl><Input placeholder="Kigali" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>{t("Igihugu", "Igihugu")}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="preferences" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <Palette className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Ibyo Uhitamo", "Ibyo Uhitamo")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                       <FormField control={form.control} name="preferredLanguage" render={({ field }) => ( <FormItem> <FormLabel>{t("Ururimi Uhitamo", "Ururimi Uhitamo")}</FormLabel> 
                         <FormControl>
                            <Select onValueChange={handleLanguageChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kn">Kinyarwanda</SelectItem>
                                    <SelectItem value="en">English (Icyongereza)</SelectItem>
                                    <SelectItem value="fr" disabled>{t("Igifaransa (Ntibyuzuye)", "Igifaransa (Ntibyuzuye)")}</SelectItem>
                                </SelectContent>
                            </Select>
                         </FormControl> 
                       <FormDescription>{t("Ibi byifuzo ntibizabikwa muri iyi prototype kuko localStorage yakuweho.", "Ibi byifuzo ntibizabikwa muri iyi prototype kuko localStorage yakuweho.")}</FormDescription> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="theme" render={({ field }) => ( <FormItem> <FormLabel>{t("Insanganyamatsiko", "Insanganyamatsiko")}</FormLabel> 
                         <FormControl>
                            <Select onValueChange={handleThemeChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light"><div className="flex items-center"><Sun className="mr-2 h-4 w-4"/>{t("Urumuri", "Urumuri")}</div></SelectItem>
                                    <SelectItem value="dark"><div className="flex items-center"><Moon className="mr-2 h-4 w-4"/>{t("Umwijima", "Umwijima")}</div></SelectItem>
                                    <SelectItem value="system"><div className="flex items-center"><SettingsIcon className="mr-2 h-4 w-4"/>{t("Ibya Sisitemu", "Ibya Sisitemu")}</div></SelectItem>
                                </SelectContent>
                            </Select>
                         </FormControl> 
                       <FormDescription>{t("Ibi byifuzo ntibizabikwa muri iyi prototype kuko localStorage yakuweho.", "Ibi byifuzo ntibizabikwa muri iyi prototype kuko localStorage yakuweho.")}</FormDescription> <FormMessage /> </FormItem> )} />
                       <FormField control={form.control} name="enableMarketingEmails" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>{t("Email z'Ubucuruzi", "Email z'Ubucuruzi")}</FormLabel> <FormDescription>{t("Yakira amakuru ku bishya n'amatangazo.", "Yakira amakuru ku bishya n'amatangazo.")}</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="enableAppNotifications" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>{t("Imenyesha ryo muri Porogaramu", "Imenyesha ryo muri Porogaramu")}</FormLabel> <FormDescription>{t("Yakira amatangazo n'amakuru y'ingenzi muri porogaramu.", "Yakira amatangazo n'amakuru y'ingenzi muri porogaramu.")}</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                    </AccordionContent>
                  </AccordionItem>

                   <AccordionItem value="emergency" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <Shield className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Uwo Guhamagara Byihutirwa", "Uwo Guhamagara Byihutirwa")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="emergencyContactName" render={({ field }) => ( <FormItem> <FormLabel>{t("Izina ry'Uwo Guhamagara", "Izina ry'Uwo Guhamagara")}</FormLabel> <FormControl><Input placeholder={t("Amazina yuzuye y'uwo guhamagara byihutirwa", "Amazina yuzuye y'uwo guhamagara byihutirwa")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => ( <FormItem> <FormLabel>{t("Telefone y'Uwo Guhamagara", "Telefone y'Uwo Guhamagara")}</FormLabel> <FormControl><Input type="tel" placeholder={t("Nimero ya telefone y'uwo guhamagara byihutirwa", "Nimero ya telefone y'uwo guhamagara byihutirwa")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="securitySettings" className="border-b-0">
                     <AccordionTrigger className="hover:no-underline text-xl font-semibold text-primary py-3 group">
                       <LockKeyhole className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /> {t("Igenamiterere ry'Umutekano", "Igenamiterere ry'Umutekano")}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      <FormField control={form.control} name="currentPassword" render={({ field }) => ( <FormItem> <FormLabel>{t("Ijambobanga rya None", "Ijambobanga rya None")}</FormLabel> <FormControl><Input type="password" placeholder={t("Shyiramo ijambobanga rya none (ry'igerageza)", "Shyiramo ijambobanga rya none (ry'igerageza)")} {...field} /></FormControl> <FormDescription>{t("Rirakenewe kugirango ushyireho ijambobanga rishya. Ibi ntibizakora nta seriveri.", "Rirakenewe kugirango ushyireho ijambobanga rishya. Ibi ntibizakora nta seriveri.")}</FormDescription> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="newPassword" render={({ field }) => ( <FormItem> <FormLabel>{t("Ijambobanga Rishya", "Ijambobanga Rishya")}</FormLabel> <FormControl><Input type="password" placeholder={t("Shyiramo ijambobanga rishya (ry'igerageza)", "Shyiramo ijambobanga rishya (ry'igerageza)")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="confirmNewPassword" render={({ field }) => ( <FormItem> <FormLabel>{t("Emeza Ijambobanga Rishya", "Emeza Ijambobanga Rishya")}</FormLabel> <FormControl><Input type="password" placeholder={t("Emeza ijambobanga rishya (ry'igerageza)", "Emeza ijambobanga rishya (ry'igerageza)")} {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="enableTwoFactor" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20">
                            <div className="space-y-0.5"> <FormLabel>{t("Kwemeza mu Byiciro Bibiri", "Kwemeza mu Byiciro Bibiri")}</FormLabel> <FormDescription>{t("Ongera umutekano wa konti yawe (Igerageza - bisaba seriveri).", "Ongera umutekano wa konti yawe (Igerageza - bisaba seriveri).")}</FormDescription> </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
                
                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={form.formState.isSubmitting} className="transition-transform hover:scale-105 active:scale-95 py-3 px-6 text-base">
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    {form.formState.isSubmitting ? t("Kubika...", "Kubika...") : t("Bika Impinduka Zose (Igerageza)", "Bika Impinduka Zose (Igerageza)")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xl hover-lift dark:shadow-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-lg">{t("Ibikorwa bya Konti", "Ibikorwa bya Konti")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("My Medical Records", "Amadosiye Yanjye y'Ubuvuzi")}> <FileText className="mr-2 h-4 w-4" /> {t("Amadosiye Yanjye y'Ubuvuzi (Igerageza)", "Amadosiye Yanjye y'Ubuvuzi (Igerageza)")} </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("My Order History", "Amateka y'Ibyo Natumije")}> <FileClock className="mr-2 h-4 w-4" /> {t("Amateka y'Ibyo Natumije (Igerageza)", "Amateka y'Ibyo Natumije (Igerageza)")} </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("Login History", "Amateka y'Uko Ninjiye")}> <History className="mr-2 h-4 w-4" /> {t("Amateka y'Uko Ninjiye (Igerageza)", "Amateka y'Uko Ninjiye (Igerageza)")} </Button>
              <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 hover-lift" onClick={() => handleMockAction("Communication History", "Amateka y'Itumanaho")}> <MessageCircle className="mr-2 h-4 w-4" /> {t("Amateka y'Itumanaho (Igerageza)", "Amateka y'Itumanaho (Igerageza)")} </Button>
            </CardContent>
          </Card>
           <Card className="shadow-xl hover-lift border-destructive/30 dark:border-destructive/50 dark:shadow-destructive/10">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-destructive">{t("Amakuru & Ubuzima Bwite", "Amakuru & Ubuzima Bwite")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <Button variant="outline" className="w-full justify-start text-left transition-colors hover:border-destructive hover:text-destructive/80 hover:bg-destructive/5 hover-lift" onClick={() => handleMockAction("Export My Data", "Ohereza Amakuru Yanjye")}><Database className="mr-2 h-4 w-4"/> {t("Ohereza Amakuru Yanjye (Igerageza)", "Ohereza Amakuru Yanjye (Igerageza)")}</Button>
              <Button variant="destructive" className="w-full justify-start text-left transition-opacity hover:opacity-90 hover-lift" onClick={() => handleMockAction("Deactivate Account", "Hagarika Konti")}>
                <PowerOff className="mr-2 h-4 w-4" /> {t("Hagarika Konti (Igerageza)", "Hagarika Konti (Igerageza)")}
              </Button>
               <p className="text-xs text-muted-foreground mt-2">{t("Guhagarika konti yawe ntibisubirwaho. Nyamuneka wizere. Ibi ntibikora nta seriveri.", "Guhagarika konti yawe ntibisubirwaho. Nyamuneka wizere. Ibi ntibikora nta seriveri.")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      </FormProvider>
    </AppLayout>
  );
}
