
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
import { Bell, CreditCard as PaymentIcon, ShieldCheck, Palette, Server, Save, DatabaseZap, FileJson, Users, BarChartHorizontalBig, KeyRound, DollarSign, UsersRound, Briefcase, BarChartBig, GitBranch, Moon, Sun, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
    const theme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (theme) setCurrentTheme(theme);
  }, []);

  const t = (enText: string, knText: string) => currentLanguage === 'kn' ? knText : enText;

  const handleSaveChanges = (section: string) => {
    toast({
      title: t(`${section} Settings Saved`, `Igenamiterere rya ${section} Ryabitswe`),
      description: t(`Your changes to ${section.toLowerCase()} settings have been applied. (Mock)`, `Impinduka zawe ku igenamiterere rya ${section.toLowerCase()} zakoreshejwe. (By'agateganyo)`),
    });
    if (section === "General") {
        localStorage.setItem('theme', currentTheme);
        if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (currentTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.remove('dark'); // remove dark first
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            }
        }
        const defaultLangSelect = document.getElementById('defaultLanguage') as HTMLSelectElement | null;
        if(defaultLangSelect?.value) {
            localStorage.setItem('mockUserLang', defaultLangSelect.value);
            setCurrentLanguage(defaultLangSelect.value as 'en' | 'kn');
            document.documentElement.lang = defaultLangSelect.value;
             window.dispatchEvent(new StorageEvent('storage', { key: 'mockUserLang', newValue: defaultLangSelect.value }));
        }
         window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: currentTheme }));
    }
  };

  const handleThemeChange = (themeValue: 'light' | 'dark' | 'system') => {
    setCurrentTheme(themeValue);
  };


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
      
      <Accordion type="multiple" defaultValue={['general', 'notifications', 'advanced']} className="w-full space-y-4">
        
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
                <Label htmlFor="appName">{t("Application Name", "Izina rya Porogaramu")}</Label>
                <Input id="appName" defaultValue="MediServe Hub" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="logoUpload">{t("Logo Upload", "Gushyiramo Ikirango")}</Label>
                <Input id="logoUpload" type="file" className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                <p className="text-xs text-muted-foreground mt-1">{t("Recommended format: PNG, SVG. Max size: 1MB.", "Uburyo busabwa: PNG, SVG. Ingano ntarengwa: 1MB.")}</p>
              </div>
               <div>
                <Label htmlFor="defaultLanguage">{t("Default System Language", "Ururimi Rusanzwe rwa Sisitemu")}</Label>
                 <Select defaultValue={currentLanguage} onValueChange={(value) => { /* Handled by save */ }}>
                  <SelectTrigger id="defaultLanguage" className="w-full mt-1"><SelectValue placeholder={t("Select default language", "Hitamo ururimi rusanzwe")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t("English", "Icyongereza")}</SelectItem>
                    <SelectItem value="fr">{t("French (Not fully supported)", "Igifaransa (Ntibyuzuye)")}</SelectItem>
                    <SelectItem value="kn">{t("Kinyarwanda", "Kinyarwanda")}</SelectItem>
                  </SelectContent>
                 </Select>
              </div>
              <div>
                <Label htmlFor="themePreference">{t("Theme Preference", "Insanganyamatsiko Uhitamo")}</Label>
                 <Select value={currentTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="themePreference" className="w-full mt-1">
                    <SelectValue placeholder={t("Select theme", "Hitamo insanganyamatsiko")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light"><div className="flex items-center"><Sun className="mr-2 h-4 w-4"/>{t("Light", "Urumuri")}</div></SelectItem>
                    <SelectItem value="dark"><div className="flex items-center"><Moon className="mr-2 h-4 w-4"/>{t("Dark", "Umwijima")}</div></SelectItem>
                    <SelectItem value="system"><div className="flex items-center"><SettingsIcon className="mr-2 h-4 w-4"/>{t("System Default", "Ibya Sisitemu")}</div></SelectItem>
                  </SelectContent>
                 </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenanceMode" />
                <Label htmlFor="maintenanceMode">{t("Enable Maintenance Mode", "Fungura Uburyo bw'Igisubizo")}</Label>
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
               <div className="flex items-center space-x-2"> <Switch id="allowPublicRegistration" defaultChecked/> <Label htmlFor="allowPublicRegistration">{t("Allow Public Patient Registration", "Emera Kwiyandikisha ku Barwayi Rusange")}</Label> </div>
               <div className="flex items-center space-x-2"> <Switch id="requireEmailVerification" defaultChecked/> <Label htmlFor="requireEmailVerification">{t("Require Email Verification for New Accounts", "Saba Kwemeza Email kuri Konti Nshya")}</Label> </div>
               <div>
                <Label htmlFor="defaultRole">{t("Default Role for New Users", "Uruhare Rusanzwe rw'Abakoresha Bashya")}</Label>
                 <Select defaultValue="patient">
                  <SelectTrigger className="w-full mt-1"><SelectValue placeholder={t("Select default role", "Hitamo uruhare rusanzwe")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">{t("Patient", "Umurwayi")}</SelectItem>
                    <SelectItem value="seeker">{t("Health Seeker", "Ushaka Ubujyanama")}</SelectItem>
                  </SelectContent>
                 </Select>
              </div>
               <Button variant="outline" onClick={() => toast({title: t("Role Permissions (Mock)", "Uburenganzira bw'Inshingano (Agateganyo)"), description:t("Navigating to role permission editor...", "Kujya ku muhinduzi w'uburenganzira bw'uruhare...")})} className="transition-transform hover:scale-105 active:scale-95 w-full justify-start hover:bg-primary/5 hover:border-primary"><Briefcase className="mr-2 h-4 w-4"/>{t("Manage Role Permissions", "Gucunga Uburenganzira bw'Inshingano")}</Button>
              <Button onClick={() => handleSaveChanges("User Management")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save User Settings", "Bika Igenamiterere ry'Abakoresha")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <Bell className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("Notification Settings", "Igenamiterere ry'Imenyesha")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div>
                <Label htmlFor="adminEmail">{t("Admin Notification Email", "Email y'Imenyesha y'Umunyamabanga")}</Label>
                <Input id="adminEmail" type="email" defaultValue="admin@mediservehub.com" className="mt-1" />
              </div>
              <div className="space-y-2">
                <Label>{t("Receive Admin Email Notifications For:", "Yakira Imenyesha rya Email y'Umunyamabanga Kuri:")}</Label>
                <div className="flex items-center space-x-2"> <Checkbox id="notifNewUser" defaultChecked /> <Label htmlFor="notifNewUser" className="font-normal">{t("New User Registrations", "Kwiyandikisha kw'Abakoresha Bashya")}</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifNewOrder" defaultChecked /> <Label htmlFor="notifNewOrder" className="font-normal">{t("New Medicine Orders", "Gutumiza Imiti Mishya")}</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifNewAppointment" defaultChecked /> <Label htmlFor="notifNewAppointment" className="font-normal">{t("New Appointment Bookings", "Gufata Igihe Gishya")}</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifLowStock" /> <Label htmlFor="notifLowStock" className="font-normal">{t("Low Stock Alerts", "Imenyesha ry'Ububiko Buke")}</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifSystemError" /> <Label htmlFor="notifSystemError" className="font-normal">{t("Critical System Errors", "Amakosa Akomeye ya Sisitemu")}</Label> </div>
              </div>
              <Button onClick={() => handleSaveChanges("Notification")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save Notification Settings", "Bika Igenamiterere ry'Imenyesha")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <PaymentIcon className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("Payment Gateway & Billing", "Uburyo bwo Kwishyura & Fagitire")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div> <Label htmlFor="stripeApiKey">{t("Stripe API Key (Mock)", "Urufunguzo rwa API rwa Stripe (Agateganyo)")}</Label> <Input id="stripeApiKey" type="password" placeholder="sk_test_••••••••••••••••••••" className="mt-1" /> </div>
              <div> <Label htmlFor="paypalClientId">{t("PayPal Client ID (Mock)", "ID y'Umukiriya wa PayPal (Agateganyo)")}</Label> <Input id="paypalClientId" type="password" placeholder="AZDxjD_zAd_•••••••••••••" className="mt-1" /> </div>
              <div> <Label htmlFor="momoApiKey">{t("Mobile Money API Key (Mock)", "Urufunguzo rwa API rwa Mobile Money (Agateganyo)")}</Label> <Input id="momoApiKey" type="password" placeholder={t("Enter MoMo API Key", "Andika Urufunguzo rwa API rwa MoMo")} className="mt-1" /> </div>
              <div> <Label htmlFor="currency">{t("Default Currency", "Ifaranga Rusange")}</Label> <Input id="currency" defaultValue="RWF" readOnly className="mt-1 bg-muted" /> </div>
              <div className="flex items-center space-x-2"> <Switch id="enableStripe" defaultChecked/> <Label htmlFor="enableStripe">{t("Enable Stripe", "Fungura Stripe")}</Label> </div>
              <div className="flex items-center space-x-2"> <Switch id="enablePaypal" /> <Label htmlFor="enablePaypal">{t("Enable PayPal", "Fungura PayPal")}</Label> </div>
              <div className="flex items-center space-x-2"> <Switch id="enableMomo" defaultChecked/> <Label htmlFor="enableMomo">{t("Enable Mobile Money (MTN/Airtel)", "Fungura Mobile Money (MTN/Airtel)")}</Label> </div>
              <Button onClick={() => handleSaveChanges("Payment Gateway")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save Payment Settings", "Bika Igenamiterere ry'Ubwishyu")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="security" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <ShieldCheck className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("Security & Privacy", "Umutekano & Ubuzima Bwite")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div className="flex items-center space-x-2"> <Switch id="twoFactorAuth" defaultChecked /> <Label htmlFor="twoFactorAuth">{t("Enable Two-Factor Authentication for Admins", "Fungura Kwemeza mu Byiciro Bibiri ku Banyamabanga")}</Label> </div>
              <div> <Label htmlFor="sessionTimeout">{t("Session Timeout (minutes)", "Igihe cy'Isesheni (iminota)")}</Label> <Input id="sessionTimeout" type="number" defaultValue="30" className="mt-1 w-32" /> </div>
              <div className="flex items-center space-x-2"> <Checkbox id="hipaaCompliance" defaultChecked disabled /> <Label htmlFor="hipaaCompliance" className="font-normal">{t("HIPAA Compliance Mode (System Managed)", "Uburyo bwa HIPAA (Bigenzurwa na Sisitemu)")}</Label> </div>
              <div> <Label htmlFor="ipWhitelist">{t("IP Whitelist for Admin Access (comma-separated)", "Urutonde rw'IP Zemerewe Kwinjira ku Buyobozi (zitandukanyijwe na koma)")}</Label> <Textarea id="ipWhitelist" placeholder="e.g., 192.168.1.100, 203.0.113.0/24" className="mt-1" rows={2}/> </div>
              <Button variant="outline" onClick={() => toast({title: t("Audit Logs Viewer (Mock)", "Kureba Amateka y'Ibikorwa (Agateganyo)"), description:t("Displaying audit logs...","Kwerekana amateka y'ibikorwa...")})} className="transition-transform hover:scale-105 active:scale-95 w-full justify-start hover:bg-primary/5 hover:border-primary"><BarChartHorizontalBig className="mr-2 h-4 w-4"/>{t("View Audit Logs", "Reba Amateka y'Ibikorwa")}</Button>
              <Button onClick={() => handleSaveChanges("Security")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save Security Settings", "Bika Igenamiterere ry'Umutekano")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <Server className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("Advanced Configuration", "Igenamiterere Ryimbitse")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div> <Label htmlFor="apiEndpoint">{t("API Base Endpoint", "Ingingo Shingiro ya API")}</Label> <Input id="apiEndpoint" defaultValue="/api/v1" className="mt-1" /> </div>
              <div> <Label htmlFor="genkitModel">{t("Genkit Default Model", "Modeli Isanzwe ya Genkit")}</Label> <Input id="genkitModel" defaultValue="googleai/gemini-2.0-flash" className="mt-1" /> </div>
              <div className="flex items-center space-x-2"> <Switch id="debugMode" /> <Label htmlFor="debugMode">{t("Enable Debug Mode (for developers)", "Fungura Uburyo bwo Gukemura Amakosa (ku Bateza Imbere)")}</Label> </div>
              <div className="flex items-center space-x-2"> <Switch id="featureFlags" /> <Label htmlFor="featureFlags">{t("Enable Experimental Features", "Fungura Ibintu by'Igeragezwa")}</Label> </div>
              <div> <Label htmlFor="deploymentBranch">{t("Deployment Branch (Mock)", "Ishami ryo Kohereza (Agateganyo)")}</Label> <Input id="deploymentBranch" defaultValue="main" className="mt-1" /> </div>
              <Button variant="destructive" onClick={() => toast({title: t("Cache Cleared (Mock)", "Ububiko Bwasibwe (Agateganyo)"), description: t("System cache has been cleared.", "Ububiko bwa sisitemu bwasibwe.")})} className="transition-transform hover:scale-105 active:scale-95">{t("Clear System Cache", "Siba Ububiko bwa Sisitemu")}</Button>
              <Button onClick={() => handleSaveChanges("Advanced")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save Advanced Settings", "Bika Igenamiterere Ryimbitse")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="integrations" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <KeyRound className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("API Integrations (Mock)", "Guhuza API (Agateganyo)")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div> <Label htmlFor="smsGatewayKey">{t("SMS Gateway API Key (e.g. Twilio)", "Urufunguzo rwa API rw'Uburyo bwa SMS (urugero: Twilio)")}</Label> <Input id="smsGatewayKey" type="password" placeholder={t("Enter SMS Gateway API Key", "Andika Urufunguzo rwa API rw'Uburyo bwa SMS")} className="mt-1" /> </div>
              <div> <Label htmlFor="emailServiceKey">{t("Email Service API Key (e.g., SendGrid)", "Urufunguzo rwa API rw'Uburyo bwa Email (urugero: SendGrid)")}</Label> <Input id="emailServiceKey" type="password" placeholder={t("Enter Email Service API Key", "Andika Urufunguzo rwa API rw'Uburyo bwa Email")} className="mt-1" /> </div>
              <div> <Label htmlFor="emrIntegrationKey">{t("EHR/EMR Integration API Key", "Urufunguzo rwa API rwo Guhuza na EHR/EMR")}</Label> <Input id="emrIntegrationKey" type="password" placeholder={t("Enter EMR API Key", "Andika Urufunguzo rwa API rwa EMR")} className="mt-1" /> </div>
              <div> <Label htmlFor="analyticsServiceKey">{t("Analytics Service Key (e.g. Google Analytics)", "Urufunguzo rw'Uburyo bw'Isesengura (urugero: Google Analytics)")}</Label> <Input id="analyticsServiceKey" type="password" placeholder={t("Enter Analytics Key", "Andika Urufunguzo rw'Isesengura")} className="mt-1" /> </div>
              <Button onClick={() => handleSaveChanges("Integrations")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save Integration Settings", "Bika Igenamiterere ryo Guhuza")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dataManagement" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <DatabaseZap className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">{t("Data Management (Mock)", "Gucunga Amakuru (Agateganyo)")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start transition-transform hover:scale-105 active:scale-95 hover:bg-primary/5 hover:border-primary" onClick={() => toast({title:t("Data Exported (Mock)", "Amakuru Yoherejwe (Agateganyo)"), description:t("User data export initiated.","Kohereza amakuru y'umukoresha byatangiye.")})}><Users className="mr-2 h-4 w-4"/>{t("Export User Data (JSON/CSV)", "Kohereza Amakuru y'Abakoresha (JSON/CSV)")}</Button>
              <Button variant="outline" className="w-full justify-start transition-transform hover:scale-105 active:scale-95 hover:bg-primary/5 hover:border-primary" onClick={() => toast({title:t("Backup Created (Mock)", "Ububiko Bwakozwe (Agateganyo)"), description:t("System backup successfully created.","Ububiko bwa sisitemu bwakozwe neza.")})}> <DatabaseZap className="mr-2 h-4 w-4"/>{t("Create Full System Backup", "Kora Ububiko Buzuye bwa Sisitemu")}</Button>
              <div>
                <Label htmlFor="retentionPolicy">{t("Data Retention Policy (Days)", "Politiki yo Kubika Amakuru (Iminsi)")}</Label>
                <Input id="retentionPolicy" type="number" defaultValue="365" className="mt-1 w-32" />
                 <p className="text-xs text-muted-foreground mt-1">{t("Set how long user data and logs are kept.", "Shiraho igihe amakuru y'abakoresha n'amateka bibikwa.")}</p>
              </div>
              <Button onClick={() => handleSaveChanges("Data Management")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />{t("Save Data Policies", "Bika Politiki z'Amakuru")}</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </AppLayout>
  );
}
