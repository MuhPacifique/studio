
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
import { Edit3, Save, Shield, Bell, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [userName, setUserName] = useState("User Name"); // Placeholder
  const [userEmail, setUserEmail] = useState("user@example.com"); // Placeholder
  const [initials, setInitials] = useState("UN");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      const storedUserName = localStorage.getItem('mockUserName') || "Patty Patient"; // Example if you store name
      const storedUserEmail = localStorage.getItem('mockUserEmail') || "patient@example.com"; // Example

      if (!authStatus) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in to view your profile.",
        });
        router.replace('/login');
      } else {
        setUserName(authStatus === 'admin' ? "Admin User" : storedUserName);
        setUserEmail(authStatus === 'admin' ? "admin@mediservehub.com" : storedUserEmail);
        
        const nameParts = (authStatus === 'admin' ? "Admin User" : storedUserName).split(' ');
        const firstInitial = nameParts[0]?.[0] || '';
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
        setInitials((firstInitial + lastInitial).toUpperCase() || "U");
      }
    }
  }, [isClient, router, toast]);

  if (!isClient || !localStorage.getItem('mockAuth')) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="My Profile" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Profile"}]}/>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Information Card */}
        <Card className="md:col-span-2 shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src="https://placehold.co/100x100.png" alt={userName} data-ai-hint="profile picture" />
                <AvatarFallback className="text-2xl text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-headline">{userName}</CardTitle>
                <CardDescription>{userEmail}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={userName} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={userEmail} readOnly />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="e.g., +250 7XX XXX XXX" />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth (Optional)</Label>
                  <Input id="dob" type="date" />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Address Information (Optional)</h3>
              <div className="space-y-4">
                <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="Kigali Heights, KG 7 Ave" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Kigali" />
                    </div>
                    <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" defaultValue="Rwanda" />
                    </div>
                </div>
              </div>
            </div>
             <div className="flex justify-end">
              <Button><Save className="mr-2 h-4 w-4"/>Save Changes (Mock)</Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings & Actions Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start text-left">
              <Shield className="mr-2 h-4 w-4" /> Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start text-left">
              <Bell className="mr-2 h-4 w-4" /> Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start text-left">
              <FileText className="mr-2 h-4 w-4" /> My Medical Records (Mock)
            </Button>
             <Separator />
            <Button variant="destructive" className="w-full justify-start text-left">
              <Edit3 className="mr-2 h-4 w-4" /> Deactivate Account (Mock)
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
