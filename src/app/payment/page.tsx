
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, DollarSign, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const paymentSchema = z.object({
  amount: z.coerce.number().min(100, { message: "Amount must be at least 100 RWF." }),
  paymentMethod: z.enum(["creditCard", "mobileMoney", "other"], {
    required_error: "You need to select a payment method.",
  }),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  mobileNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "creditCard") {
    if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid card number (must be 16 digits).", path: ["cardNumber"] });
    }
    if (!data.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid expiry date (MM/YY).", path: ["expiryDate"] });
    }
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid CVV (3 or 4 digits).", path: ["cvv"] });
    }
  }
  if (data.paymentMethod === "mobileMoney") {
    // Basic Rwandan phone number check (starts with 07, typically 10 digits)
    if (!data.mobileNumber || !/^07[2389]\d{7}$/.test(data.mobileNumber)) { 
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Rwandan mobile number (e.g., 07XXXXXXXX).", path: ["mobileNumber"] });
    }
  }
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 5000, 
      paymentMethod: undefined,
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authStatus = localStorage.getItem('mockAuth');
      if (!authStatus) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in to make a payment.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);


  const onSubmit = async (data: PaymentFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Payment Processed (Mock)",
      description: `Successfully processed ${data.amount.toLocaleString()} RWF via ${data.paymentMethod}. This is a demo, no actual payment was made.`,
    });
    form.reset();
  };

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Payment Gateway...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Online Payment" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Payment"}]} />
      <Card className="w-full max-w-2xl mx-auto shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><DollarSign className="mr-2 h-6 w-6 text-primary" />Secure Payment Gateway</CardTitle>
          <CardDescription>Complete your payment for services or orders in RWF. This is a demonstration and no real transaction will occur.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (RWF)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter amount in RWF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="creditCard" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center"><CreditCard className="mr-2 h-5 w-5 text-blue-500" /> Credit/Debit Card</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="mobileMoney" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center"><Smartphone className="mr-2 h-5 w-5 text-green-500" /> Mobile Money</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">Other</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentMethod === 'creditCard' && (
                <div className="space-y-6 p-4 border rounded-md bg-muted/30 dark:bg-muted/10">
                  <h3 className="text-lg font-medium">Card Details</h3>
                  <FormField control={form.control} name="cardNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="expiryDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (MM/YY)</FormLabel>
                        <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="cvv" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl><Input placeholder="123" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </div>
              )}

              {paymentMethod === 'mobileMoney' && (
                <div className="space-y-6 p-4 border rounded-md bg-muted/30 dark:bg-muted/10">
                   <h3 className="text-lg font-medium">Mobile Money Details</h3>
                  <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number (e.g. 078xxxxxxx)</FormLabel>
                      <FormControl><Input type="tel" placeholder="Enter mobile number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                   <FormItem>
                      <FormLabel>Provider</FormLabel>
                       <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mobile money provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                          <SelectItem value="airtel">Airtel Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                </div>
              )}
              
              {paymentMethod === 'other' && (
                 <div className="p-4 border rounded-md bg-muted/30 dark:bg-muted/10">
                    <p className="text-muted-foreground">Please contact support for other payment methods.</p>
                 </div>
              )}


              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting || !paymentMethod}>
                {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : `Pay ${(form.getValues("amount") || 0).toLocaleString()} RWF`}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
