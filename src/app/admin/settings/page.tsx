
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Bell, CreditCard as PaymentIcon, ShieldCheck, Palette, Server, Save, DatabaseZap, FileJson, Users, BarChartHorizontalBig, KeyRound, DollarSign, UsersRound, Briefcase, BarChartBig, GitBranch, Moon, Sun, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

const t = (enText: string, knText: string) => knText; // Default to Kinyarwanda

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);

  // State for form fields - normally these would be fetched from a backend
  const [appName, setAppName] = useState("MediServe Hub");
  const [defaultLanguage, setDefaultLanguage] = useState<'en' | 'kn' | 'fr'>('kn');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  // ... other settings states

  useEffect(() => {
    // Simulate checking admin authentication status
    const simulateAuthCheck = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      // For prototype, assume authenticated if reaching here via admin flow
      setIsAuthenticatedAdmin(true);
      setIsLoading(false);
      // In real app, fetch current settings from backend here
    };
    simulateAuthCheck();
  }, []);


  const handleSaveChanges = (section: string) => {
    // Simulate saving settings to a backend
    toast({
      title: t(`${section} Settings Saved (Mock)`, `Igenamiterere rya ${section} Ryabitswe (By'agateganyo)`),
      description: t(`Your changes to ${section.toLowerCase()} settings would be applied server-side.`, `Impinduka zawe ku igenamiterere rya ${section.toLowerCase()} zakoreshejwe ku rubuga rw'inyuma.`),
    });

    if (section === "General") {
        // These UI changes are client-side for immediate feedback,
        // but persistence is now conceptual (backend's job)
        document.documentElement.lang = defaultLanguage;
        
        document.documentElement.classList.remove('light', 'dark');
        if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (currentTheme === 'light') {
            document.documentElement.classList.remove('dark'); // Ensure light mode if explicitly set
        } else { // System preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                 document.documentElement.classList.remove('dark');
            }
        }
        // dispatchEvent for other components is removed as localStorage is gone.
        // Components should re-read from a global state or props if live updates are needed.
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title={t("System Settings", "Igenamiterere rya Sisitemu")} />
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t("Loading settings...", "Gutegura igenamiterere...")}</p>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticatedAdmin) {
    toast({ variant: "destructive", title: t("Access Denied", "Ntabwo Wemerewe") });
    router.replace('/admin/login');
    return null;
  }

  return (
    <AppLayout>
      <PageHeader 
        title={t("System Settings", "Igenamiterere rya Sisitemu")} 
        breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Admin", "Ubuyobozi"), href: "/admin/dashboard"}, 
            {label: t("Settings", "Igenamiterere")}
        ]}
      />
      
      <Accordion type="multiple" defaultValue={['general', 'notifications']} className="w-full space-y-4">
        
        <AccordionItem value="general" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <SettingsIcon className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("General & Appearance", "Rusange & Imigaragarire")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div>
                <Label htmlFor="appNameInput">{t("Application Name", "Izina rya Porogaramu")}</Label>
                <Input id="appNameInput" value={appName} onChange={(e) => setAppName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="logoUpload">{t("Logo Upload", "Gushyiramo Ikirango")}</Label>
                <Input id="logoUpload" type="file" className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                <p className="text-xs text-muted-foreground mt-1">{t("Recommended format: PNG, SVG. Max size: 1MB.", "Uburyo busabwa: PNG, SVG. Ingano ntarengwa: 1MB.")}</p>
              </div>
               <div>
                <Label htmlFor="defaultLanguageSelect">{t("Default System Language", "Ururimi Rusanzwe rwa Sisitemu")}</Label>
                 <Select value={defaultLanguage} onValueChange={(value) => setDefaultLanguage(value as 'en' | 'kn' | 'fr')}>
                  <SelectTrigger id="defaultLanguageSelect" className="w-full mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kn">{t("Kinyarwanda", "Kinyarwanda")}</SelectItem>
                    <SelectItem value="en">{t("English", "Icyongereza")}</SelectItem>
                    <SelectItem value="fr">{t("French (Not fully supported)", "Igifaransa (Ntibyuzuye)")}</SelectItem>
                  </SelectContent>
                 </Select>
              </div>
              <div>
                <Label htmlFor="themePreferenceSelect">{t("Theme Preference", "Insanganyamatsiko Uhitamo")}</Label>
                 <Select value={currentTheme} onValueChange={(value) => setCurrentTheme(value as 'light' | 'dark' | 'system')}>
                  <SelectTrigger id="themePreferenceSelect" className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light"><div className="flex items-center"><Sun className="mr-2 h-4 w-4"/>{t("Light", "Urumuri")}</div></SelectItem>
                    <SelectItem value="dark"><div className="flex items-center"><Moon className="mr-2 h-4 w-4"/>{t("Dark", "Umwijima")}</div></SelectItem>
                    <SelectItem value="system"><div className="flex items-center"><SettingsIcon className="mr-2 h-4 w-4"/>{t("System Default", "Ibya Sisitemu")}</div></SelectItem>
                  </SelectContent>
                 </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenanceModeSwitch" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                <Label htmlFor="maintenanceModeSwitch">{t("Enable Maintenance Mode", "Fungura Uburyo bw'Igisubizo")}</Label>
              </div>
              <Button onClick={() => handleSaveChanges("General")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save General Settings", "Bika Igenamiterere Rusange")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="userManagement" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <UsersRound className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("User & Role Management", "Gucunga Abakoresha & Inshingano")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
               <div className="flex items-center space-x-2"> <Switch id="allowPublicRegistration" defaultChecked disabled/> <Label htmlFor="allowPublicRegistration">{t("Allow Public Patient Registration (Backend controlled)", "Emera Kwiyandikisha ku Barwayi Rusange (Bigenzurwa n'inyuma)")}</Label> </div>
               <div className="flex items-center space-x-2"> <Switch id="requireEmailVerification" defaultChecked disabled/> <Label htmlFor="requireEmailVerification">{t("Require Email Verification (Backend controlled)", "Saba Kwemeza Email (Bigenzurwa n'inyuma)")}</Label> </div>
               <div>
                <Label htmlFor="defaultRole">{t("Default Role for New Users (Backend logic)", "Uruhare Rusanzwe (Logique y'inyuma)")}</Label>
                 <Select defaultValue="patient" disabled>
                  <SelectTrigger className="w-full mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">{t("Patient", "Umurwayi")}</SelectItem>
                    <SelectItem value="seeker">{t("Health Seeker", "Ushaka Ubujyanama")}</SelectItem>
                  </SelectContent>
                 </Select>
              </div>
               <Button variant="outline" onClick={() => toast({title: t("Role Permissions (Mock)", "Uburenganzira bw'Inshingano (Agateganyo)"), description:t("Navigating to role permission editor... (Backend feature)", "Kujya ku muhinduzi w'uburenganzira bw'uruhare... (Igice cy'inyuma)")})} className="transition-transform hover:scale-105 active:scale-95 w-full justify-start hover:bg-primary/5 hover:border-primary"><Briefcase className="mr-2 h-4 w-4"/>{t("Manage Role Permissions", "Gucunga Uburenganzira bw'Inshingano")}</Button>
              <Button onClick={() => handleSaveChanges("User Management")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save User Settings", "Bika Igenamiterere ry'Abakoresha")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Other AccordionItems (Notifications, Payment, Security, Advanced, Integrations, Data Management) */}
        {/* These would also have their state managed and "Save" buttons would conceptually send data to backend */}
        <AccordionItem value="notifications" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group"><div className="flex items-center"><Bell className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /><span className="font-headline text-lg">{t("Notification Settings", "Igenamiterere ry'Imenyesha")}</span></div></AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0 space-y-6">
             <div><Label>{t("Admin Notification Email (Server Configured)", "Email y'Imenyesha y'Umunyamabanga (Byateguwe ku Nserveri)")}</Label><Input value="admin@mediservehub.com" readOnly className="mt-1 bg-muted"/></div>
             <Button onClick={() => handleSaveChanges("Notification")}><Save className="mr-2 h-4 w-4" />{t("Save Notification Settings", "Bika Igenamiterere ry'Imenyesha")}</Button>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="payment" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group"><div className="flex items-center"><PaymentIcon className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" /><span className="font-headline text-lg">{t("Payment Gateway & Billing (Server Configured)", "Uburyo bwo Kwishyura & Fagitire (Byateguwe ku Nserveri)")}</span></div></AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0 space-y-6">
            <p className="text-sm text-muted-foreground">{t("Payment gateway configurations are managed on the backend for security.", "Igenamiterere ry'uburyo bwo kwishyura rigenzurwa ku nserveri kubw'umutekano.")}</p>
             <Button onClick={() => handleSaveChanges("Payment Gateway")}><Save className="mr-2 h-4 w-4" />{t("Save Payment Settings", "Bika Igenamiterere ry'Ubwishyu")}</Button>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </AppLayout>
  );
}
