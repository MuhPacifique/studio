
"use client";

import React from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Bell, CreditCard as PaymentIcon, ShieldCheck, Palette, Server, Save, DatabaseZap, FileJson, Users, BarChartHorizontalBig, KeyRound, DollarSign, UsersRound, Briefcase, BarChartBig } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = (section: string) => {
    toast({
      title: `${section} Settings Saved`,
      description: `Your changes to ${section.toLowerCase()} settings have been applied. (Mock)`,
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="System Settings" 
        breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Admin", href: "/admin/dashboard"}, {label: "Settings"}]}
      />
      
      <Accordion type="multiple" defaultValue={['general', 'notifications', 'advanced']} className="w-full space-y-4">
        
        <AccordionItem value="general" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <Palette className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">General & Appearance</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div>
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" defaultValue="MediServe Hub" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="logoUpload">Logo Upload</Label>
                <Input id="logoUpload" type="file" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Recommended format: PNG, SVG. Max size: 1MB.</p>
              </div>
               <div>
                <Label htmlFor="defaultLanguage">Default Language</Label>
                 <Select>
                  <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select default language" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="kin">Kinyarwanda</SelectItem>
                  </SelectContent>
                 </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenanceMode" />
                <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
              </div>
              <Button onClick={() => handleSaveChanges("General")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save General Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="userManagement" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <UsersRound className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">User & Role Management</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
               <div className="flex items-center space-x-2"> <Switch id="allowPublicRegistration" defaultChecked/> <Label htmlFor="allowPublicRegistration">Allow Public Patient Registration</Label> </div>
               <div className="flex items-center space-x-2"> <Switch id="requireEmailVerification" defaultChecked/> <Label htmlFor="requireEmailVerification">Require Email Verification for New Accounts</Label> </div>
               <div>
                <Label htmlFor="defaultRole">Default Role for New Users</Label>
                 <Select defaultValue="patient">
                  <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select default role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="seeker">Health Seeker</SelectItem>
                  </SelectContent>
                 </Select>
              </div>
               <Button variant="outline" onClick={() => toast({title: "Role Permissions (Mock)", description:"Navigating to role permission editor..."})} className="transition-transform hover:scale-105 active:scale-95 w-full justify-start"><Briefcase className="mr-2 h-4 w-4"/>Manage Role Permissions</Button>
              <Button onClick={() => handleSaveChanges("User Management")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save User Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <Bell className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">Notification Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div>
                <Label htmlFor="adminEmail">Admin Notification Email</Label>
                <Input id="adminEmail" type="email" defaultValue="admin@mediservehub.com" className="mt-1" />
              </div>
              <div className="space-y-2">
                <Label>Receive Admin Email Notifications For:</Label>
                <div className="flex items-center space-x-2"> <Checkbox id="notifNewUser" defaultChecked /> <Label htmlFor="notifNewUser" className="font-normal">New User Registrations</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifNewOrder" defaultChecked /> <Label htmlFor="notifNewOrder" className="font-normal">New Medicine Orders</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifNewAppointment" defaultChecked /> <Label htmlFor="notifNewAppointment" className="font-normal">New Appointment Bookings</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifLowStock" /> <Label htmlFor="notifLowStock" className="font-normal">Low Stock Alerts</Label> </div>
                <div className="flex items-center space-x-2"> <Checkbox id="notifSystemError" /> <Label htmlFor="notifSystemError" className="font-normal">Critical System Errors</Label> </div>
              </div>
              <Button onClick={() => handleSaveChanges("Notification")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save Notification Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <PaymentIcon className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">Payment Gateway & Billing</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div> <Label htmlFor="stripeApiKey">Stripe API Key (Mock)</Label> <Input id="stripeApiKey" type="password" placeholder="sk_test_••••••••••••••••••••" className="mt-1" /> </div>
              <div> <Label htmlFor="paypalClientId">PayPal Client ID (Mock)</Label> <Input id="paypalClientId" type="password" placeholder="AZDxjD_zAd_•••••••••••••" className="mt-1" /> </div>
              <div> <Label htmlFor="momoApiKey">Mobile Money API Key (Mock)</Label> <Input id="momoApiKey" type="password" placeholder="Enter MoMo API Key" className="mt-1" /> </div>
              <div> <Label htmlFor="currency">Default Currency</Label> <Input id="currency" defaultValue="RWF" readOnly className="mt-1 bg-muted" /> </div>
              <div className="flex items-center space-x-2"> <Switch id="enableStripe" defaultChecked/> <Label htmlFor="enableStripe">Enable Stripe</Label> </div>
              <div className="flex items-center space-x-2"> <Switch id="enablePaypal" /> <Label htmlFor="enablePaypal">Enable PayPal</Label> </div>
              <div className="flex items-center space-x-2"> <Switch id="enableMomo" defaultChecked/> <Label htmlFor="enableMomo">Enable Mobile Money (MTN/Airtel)</Label> </div>
              <Button onClick={() => handleSaveChanges("Payment Gateway")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save Payment Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="security" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <ShieldCheck className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">Security & Privacy</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div className="flex items-center space-x-2"> <Switch id="twoFactorAuth" defaultChecked /> <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication for Admins</Label> </div>
              <div> <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label> <Input id="sessionTimeout" type="number" defaultValue="30" className="mt-1 w-32" /> </div>
              <div className="flex items-center space-x-2"> <Checkbox id="hipaaCompliance" defaultChecked disabled /> <Label htmlFor="hipaaCompliance" className="font-normal">HIPAA Compliance Mode (System Managed)</Label> </div>
              <div> <Label htmlFor="ipWhitelist">IP Whitelist for Admin Access (comma-separated)</Label> <Textarea id="ipWhitelist" placeholder="e.g., 192.168.1.100, 203.0.113.0/24" className="mt-1" rows={2}/> </div>
              <Button variant="outline" onClick={() => toast({title: "Audit Logs Viewer (Mock)", description:"Displaying audit logs..."})} className="transition-transform hover:scale-105 active:scale-95 w-full justify-start"><BarChartHorizontalBig className="mr-2 h-4 w-4"/>View Audit Logs</Button>
              <Button onClick={() => handleSaveChanges("Security")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save Security Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <Server className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">Advanced Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div> <Label htmlFor="apiEndpoint">API Base Endpoint</Label> <Input id="apiEndpoint" defaultValue="/api/v1" className="mt-1" /> </div>
              <div> <Label htmlFor="genkitModel">Genkit Default Model</Label> <Input id="genkitModel" defaultValue="googleai/gemini-2.0-flash" className="mt-1" /> </div>
              <div className="flex items-center space-x-2"> <Switch id="debugMode" /> <Label htmlFor="debugMode">Enable Debug Mode (for developers)</Label> </div>
              <div className="flex items-center space-x-2"> <Switch id="featureFlags" /> <Label htmlFor="featureFlags">Enable Experimental Features</Label> </div>
              <Button variant="destructive" onClick={() => toast({title: "Cache Cleared (Mock)", description: "System cache has been cleared."})} className="transition-transform hover:scale-105 active:scale-95">Clear System Cache</Button>
              <Button onClick={() => handleSaveChanges("Advanced")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save Advanced Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="integrations" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <KeyRound className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">API Integrations (Mock)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div> <Label htmlFor="smsGatewayKey">SMS Gateway API Key (e.g. Twilio)</Label> <Input id="smsGatewayKey" type="password" placeholder="Enter SMS Gateway API Key" className="mt-1" /> </div>
              <div> <Label htmlFor="emailServiceKey">Email Service API Key (e.g., SendGrid)</Label> <Input id="emailServiceKey" type="password" placeholder="Enter Email Service API Key" className="mt-1" /> </div>
              <div> <Label htmlFor="emrIntegrationKey">EHR/EMR Integration API Key</Label> <Input id="emrIntegrationKey" type="password" placeholder="Enter EMR API Key" className="mt-1" /> </div>
              <Button onClick={() => handleSaveChanges("Integrations")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save Integration Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dataManagement" className="border rounded-lg shadow-lg bg-card hover-lift">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center">
              <DatabaseZap className="mr-3 h-5 w-5 text-primary group-hover:animate-pulse" />
              <span className="font-headline text-lg">Data Management (Mock)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start transition-transform hover:scale-105 active:scale-95" onClick={() => toast({title:"Data Exported (Mock)", description:"User data export initiated."})}><Users className="mr-2 h-4 w-4"/>Export User Data (JSON/CSV)</Button>
              <Button variant="outline" className="w-full justify-start transition-transform hover:scale-105 active:scale-95" onClick={() => toast({title:"Backup Created (Mock)", description:"System backup successfully created."})}> <DatabaseZap className="mr-2 h-4 w-4"/>Create Full System Backup</Button>
              <div>
                <Label htmlFor="retentionPolicy">Data Retention Policy (Days)</Label>
                <Input id="retentionPolicy" type="number" defaultValue="365" className="mt-1 w-32" />
                 <p className="text-xs text-muted-foreground mt-1">Set how long user data and logs are kept.</p>
              </div>
              <Button onClick={() => handleSaveChanges("Data Management")} className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" />Save Data Policies</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </AppLayout>
  );
}
