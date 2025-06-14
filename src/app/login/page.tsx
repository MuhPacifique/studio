
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Phone } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional().refine(val => !val || val.length >= 10, { message: "Phone number must be at least 10 digits if provided."}),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('selectedRole');
    if (!role) {
      router.replace('/welcome'); 
    } else {
      setSelectedRole(role);
    }
  }, [router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const role = localStorage.getItem('selectedRole') || 'patient'; 

    let loginSuccess = false;
    let userName = "User";
    let patientId: string | null = null;

    // Mock success/failure 
    if (role === 'doctor' && data.email === "doctor@example.com" && data.password === "password") {
        loginSuccess = true;
        userName = "Dr. Alex Smith";
    } else if ((role === 'patient' || role === 'seeker') && data.email === "patient@example.com" && data.password === "password") {
        loginSuccess = true;
        userName = "Patty Patient";
        patientId = "patient123"; // Assign a mock patient ID
    } else if (role === 'seeker' && data.email === "seeker@example.com" && data.password === "password") {
        loginSuccess = true;
        userName = "Sam Seeker";
        patientId = "seeker123"; // Assign a mock patient ID
    }


    if (loginSuccess) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userName}!`,
      });
      localStorage.setItem('mockAuth', role); 
      localStorage.setItem('mockUserName', userName); 
      localStorage.setItem('mockUserEmail', data.email);
      localStorage.setItem('mockUserPhone', data.phone || "");
      if (patientId) {
        localStorage.setItem('mockPatientId', patientId);
      } else {
        localStorage.removeItem('mockPatientId'); // Clear if not relevant
      }
      router.push('/');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials for the selected role.",
      });
      form.setError("email", { type: "manual", message: " " });
      form.setError("password", { type: "manual", message: "Invalid credentials." });
    }
  };

  const pageTitle = selectedRole ? `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login` : "Login";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page p-4">
      <Link href="/welcome" className="mb-8 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
        <LogoIcon className="h-8 w-8" />
        <span className="text-2xl font-bold font-headline">MediServe Hub</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{pageTitle}</CardTitle>
          <CardDescription>Access your MediServe Hub account. You may receive a (mock) verification code.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      Phone Number (Optional for login, for verification)
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+250 7XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <p>
            Need an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
           <p>
            <Link href="/welcome" className="font-medium text-primary hover:underline">
              Back to Role Selection
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    