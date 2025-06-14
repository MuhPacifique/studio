
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  dob: z.string().optional(), // Can be refined with date validation
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [initials, setInitials] = useState("U");
  
  // Mock user data - in a real app, this would come from an API or auth context
  const [currentUser, setCurrentUser] = useState<ProfileFormValues>({
    fullName: "User Name",
    email: "user@example.com",
    phone: "",
    dob: "",
    address: "",
    city: "",
    country: "Rwanda",
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
        const userData = {
          fullName: authStatus === 'admin' ? "Admin User" : storedUserName,
          email: authStatus === 'admin' ? "admin@mediservehub.com" : storedUserEmail,
          phone: localStorage.getItem('mockUserPhone') || "",
          dob: localStorage.getItem('mockUserDOB') || "",
          address: localStorage.getItem('mockUserAddress') || "",
          city: localStorage.getItem('mockUserCity') || "",
          country: localStorage.getItem('mockUserCountry') || "Rwanda",
        };
        setCurrentUser(userData);
        form.reset(userData); // Reset form with fetched/mocked data

        const nameParts = userData.fullName.split(' ');
        const firstInitial = nameParts[0]?.[0] || '';
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
        setInitials((firstInitial + lastInitial).toUpperCase() || "U");
      }
    }
  }, [isClient, router, toast, form]);

  const onSubmit = (data: ProfileFormValues) => {
    // Mock saving data
    setCurrentUser(data); 
    // Mock persisting to localStorage if desired for some fields
    localStorage.setItem('mockUserName', data.fullName);
    localStorage.setItem('mockUserEmail', data.email); // Though email might not be editable
    localStorage.setItem('mockUserPhone', data.phone || "");
    localStorage.setItem('mockUserDOB', data.dob || "");
    localStorage.setItem('mockUserAddress', data.address || "");
    localStorage.setItem('mockUserCity', data.city || "");
    localStorage.setItem('mockUserCountry', data.country || "Rwanda");

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
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="My Profile" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Profile" }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src="https://placehold.co/100x100.png" alt={form.watch("fullName")} data-ai-hint="profile picture" />
                <AvatarFallback className="text-2xl text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-headline">{form.watch("fullName")}</CardTitle>
                <CardDescription>{form.watch("email")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input type="email" {...field} readOnly={localStorage.getItem('mockAuth') !== 'admin'} /></FormControl> 
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl><Input type="tel" placeholder="e.g., +250 7XX XXX XXX" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="dob" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth (Optional)</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Address Information (Optional)</h3>
                  <div className="space-y-4">
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl><Input placeholder="Kigali Heights, KG 7 Ave" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input placeholder="Kigali" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="country" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

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
