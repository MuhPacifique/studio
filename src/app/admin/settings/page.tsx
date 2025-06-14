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
import { Bell, CreditCard as PaymentIcon, ShieldCheck, Palette, Server, Save } from 'lucide-react'; // Renamed CreditCard to PaymentIcon to avoid conflict
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = (section: string) => {
    // Simulate saving changes
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
      
      <Accordion type="multiple" defaultValue={['general', 'notifications']} className="w-full space-y-4">
        
        {/* General Settings */}
        <AccordionItem value="general" className="border rounded-lg shadow-lg bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <Palette className="mr-3 h-5 w-5 text-primary" />
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
              <div className="flex items-center space-x-2">
                <Switch id="maintenanceMode" />
                <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
              </div>
              <Button onClick={() => handleSaveChanges("General")}><Save className="mr-2 h-4 w-4" />Save General Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Notification Settings */}
        <AccordionItem value="notifications" className="border rounded-lg shadow-lg bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <Bell className="mr-3 h-5 w-5 text-primary" />
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
                <Label>Receive Notifications For:</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifNewUser" defaultChecked />
                  <Label htmlFor="notifNewUser" className="font-normal">New User Registrations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifNewOrder" defaultChecked />
                  <Label htmlFor="notifNewOrder" className="font-normal">New Medicine Orders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifLowStock" />
                  <Label htmlFor="notifLowStock" className="font-normal">Low Stock Alerts</Label>
                </div>
              </div>
              <Button onClick={() => handleSaveChanges("Notification")}><Save className="mr-2 h-4 w-4" />Save Notification Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Payment Gateway Settings */}
        <AccordionItem value="payment" className="border rounded-lg shadow-lg bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <PaymentIcon className="mr-3 h-5 w-5 text-primary" /> {/* Using PaymentIcon alias */}
              <span className="font-headline text-lg">Payment Gateway</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div>
                <Label htmlFor="stripeApiKey">Stripe API Key (Mock)</Label>
                <Input id="stripeApiKey" type="password" placeholder="sk_test_••••••••••••••••••••" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="paypalClientId">PayPal Client ID (Mock)</Label>
                <Input id="paypalClientId" type="password" placeholder="AZDxjD_zAd_•••••••••••••" className="mt-1" />
              </div>
               <div className="flex items-center space-x-2">
                <Switch id="enableStripe" defaultChecked/>
                <Label htmlFor="enableStripe">Enable Stripe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="enablePaypal" />
                <Label htmlFor="enablePaypal">Enable PayPal</Label>
              </div>
              <Button onClick={() => handleSaveChanges("Payment Gateway")}><Save className="mr-2 h-4 w-4" />Save Payment Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Security Settings */}
        <AccordionItem value="security" className="border rounded-lg shadow-lg bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <ShieldCheck className="mr-3 h-5 w-5 text-primary" />
              <span className="font-headline text-lg">Security & Privacy</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch id="twoFactorAuth" defaultChecked />
                <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication for Admins</Label>
              </div>
               <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="30" className="mt-1 w-32" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="hipaaCompliance" defaultChecked disabled />
                <Label htmlFor="hipaaCompliance" className="font-normal">HIPAA Compliance Mode (System Managed)</Label>
              </div>
               <Button variant="outline">View Audit Logs</Button>
              <Button onClick={() => handleSaveChanges("Security")}><Save className="mr-2 h-4 w-4" />Save Security Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

         {/* Advanced Settings */}
        <AccordionItem value="advanced" className="border rounded-lg shadow-lg bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <Server className="mr-3 h-5 w-5 text-primary" />
              <span className="font-headline text-lg">Advanced Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="space-y-6">
              <div>
                <Label htmlFor="apiEndpoint">API Base Endpoint</Label>
                <Input id="apiEndpoint" defaultValue="/api/v1" className="mt-1" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="debugMode" />
                <Label htmlFor="debugMode">Enable Debug Mode (for developers)</Label>
              </div>
              <Button variant="destructive" onClick={() => toast({title: "Cache Cleared (Mock)", description: "System cache has been cleared."})}>Clear System Cache</Button>
              <Button onClick={() => handleSaveChanges("Advanced")}><Save className="mr-2 h-4 w-4" />Save Advanced Settings</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </AppLayout>
  );
}
