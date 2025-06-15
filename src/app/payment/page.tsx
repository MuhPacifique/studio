
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, DollarSign, Loader2, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

const t = (enText: string, knText: string) => knText; 

const paymentSchema = z.object({
  amount: z.coerce.number().min(100, { message: t("Amafaranga agomba kuba nibura 100 RWF.", "Amafaranga agomba kuba nibura 100 RWF.") }),
  paymentMethod: z.enum(["creditCard", "mobileMoney", "bankTransfer"], {
    required_error: t("Ugomba guhitamo uburyo bwo kwishyura.", "Ugomba guhitamo uburyo bwo kwishyura."),
  }),
  reason: z.string().min(5, {message: t("Nyamuneka tanga impamvu yo kwishyura (urugero: Itumiza #123, Amafaranga yo kubonana na muganga).", "Nyamuneka tanga impamvu yo kwishyura (urugero: Itumiza #123, Amafaranga yo kubonana na muganga).")}),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardHolderName: z.string().optional(),
  mobileNumber: z.string().optional(),
  mobileProvider: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(), 
  userReference: z.string().optional(), 
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "creditCard") {
    if (!data.cardHolderName || data.cardHolderName.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("Izina riri ku ikarita rirakenewe.", "Izina riri ku ikarita rirakenewe."), path: ["cardHolderName"] });
    }
    if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, '')) ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("Nimero y'ikarita yanditse nabi (igomba kuba imibare 16).", "Nimero y'ikarita yanditse nabi (igomba kuba imibare 16)."), path: ["cardNumber"] });
    }
    if (!data.expiryDate || !/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(data.expiryDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("Itariki yo kurangira yanditse nabi (UKWEZI/UMWAKA).", "Itariki yo kurangira yanditse nabi (UKWEZI/UMWAKA)."), path: ["expiryDate"] });
    }
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("CVV yanditse nabi (imibare 3 cyangwa 4).", "CVV yanditse nabi (imibare 3 cyangwa 4)."), path: ["cvv"] });
    }
  }
  if (data.paymentMethod === "mobileMoney") {
    if (!data.mobileNumber || !/^07[2389]\d{7}$/.test(data.mobileNumber)) { 
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("Nimero ya telefone y'u Rwanda yanditse nabi (urugero: 07XXXXXXXX).", "Nimero ya telefone y'u Rwanda yanditse nabi (urugero: 07XXXXXXXX)."), path: ["mobileNumber"] });
    }
    if (!data.mobileProvider) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("Nyamuneka hitamo umunyamitwe wa mobile money.", "Nyamuneka hitamo umunyamitwe wa mobile money."), path: ["mobileProvider"] });
    }
  }
  if (data.paymentMethod === "bankTransfer") {
    if (!data.bankName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("Nyamuneka hitamo banki yawe.", "Nyamuneka hitamo banki yawe."), path: ["bankName"] });
    }
     if (!data.userReference || data.userReference.trim().length < 3) { 
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("Referanse y'ubwishyu yemewe irakenewe.", "Referanse y'ubwishyu yemewe irakenewe."), path: ["userReference"] });
    }
  }
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const router = useRouter(); // Kept for potential future use
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Assume not authenticated until backend confirms.
  // AppLayout will handle redirection if this page is accessed without auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 5000, 
      paymentMethod: undefined,
      reason: "",
      cardHolderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      mobileNumber: "",
      mobileProvider: undefined,
      bankName: undefined,
      userReference: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    setIsClient(true);
    // No auth check here, AppLayout handles it.
    setIsLoadingPage(false);
  }, []);


  const onSubmit = async (data: PaymentFormValues) => {
    // Simulate backend payment processing. No data is persisted.
    form.formState.isSubmitting = true;
    await new Promise(resolve => setTimeout(resolve, 1500));
    form.formState.isSubmitting = false;
    
    toast({
      title: t("Ubwishyu Bwakozwe (Igerageza)", "Ubwishyu Bwakozwe (Igerageza)"),
      description: t(`Ubwishyu bwa ${data.amount.toLocaleString()} RWF bwakozwe neza binyuze muri ${data.paymentMethod} kuri: ${data.reason}. Ibi ni iby'ikitegererezo, nta bwishyu nyakuri bwakozwe. Amakuru ntazabikwa muri iyi prototype.`, `Ubwishyu bwa ${data.amount.toLocaleString()} RWF bwakozwe neza binyuze muri ${data.paymentMethod} kuri: ${data.reason}. Ibi ni iby'ikitegererezo, nta bwishyu nyakuri bwakozwe. Amakuru ntazabikwa muri iyi prototype.`),
    });
    form.reset({
        amount: 5000, 
        paymentMethod: data.paymentMethod, 
        reason: "", 
        cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "",
        mobileNumber: "", mobileProvider: undefined,
        bankName: undefined, userReference: "",
    });
  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Kwishyura Kuri Interineti", "Kwishyura Kuri Interineti")} />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Gutegura Uburyo bwo Kwishyura...", "Gutegura Uburyo bwo Kwishyura...")}</p>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    // This case should be handled by AppLayout redirection primarily.
    return (
      <AppLayout>
        <PageHeader title={t("Kwishyura Kuri Interineti", "Kwishyura Kuri Interineti")} />
        <Card className="mt-10 text-center p-10">
            <CardTitle>{t("Ugomba Kwinjira", "Ugomba Kwinjira")}</CardTitle>
            <CardDescription className="mt-2">{t("Nyamuneka injira kugirango ukore ubwishyu.", "Nyamuneka injira kugirango ukore ubwishyu.")}</CardDescription>
            <Button onClick={() => router.push('/welcome')} className="mt-6">{t("Injira / Iyandikishe", "Injira / Iyandikishe")}</Button>
        </Card>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <PageHeader title={t("Kwishyura Kuri Interineti", "Kwishyura Kuri Interineti")} breadcrumbs={[{label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/"}, {label: t("Ubwishyu", "Ubwishyu")}]} />
      <Card className="w-full max-w-2xl mx-auto shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><DollarSign className="mr-2 h-6 w-6 text-primary" />{t("Uburyo bwo Kwishyura bwizewe", "Uburyo bwo Kwishyura bwizewe")}</CardTitle>
          <CardDescription>{t("Uzuza ubwishyu bwawe bwa serivisi cyangwa ibyo watumije mu RWF. Ibi ni iby'ikitegererezo kandi nta gikorwa nyakuri kizaba. Amakuru ntazabikwa.", "Uzuza ubwishyu bwawe bwa serivisi cyangwa ibyo watumije mu RWF. Ibi ni iby'ikitegererezo kandi nta gikorwa nyakuri kizaba. Amakuru ntazabikwa.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("Amafaranga (RWF)", "Amafaranga (RWF)")}</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder={t("Andika amafaranga mu RWF", "Andika amafaranga mu RWF")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("Impamvu yo Kwishyura", "Impamvu yo Kwishyura")}</FormLabel>
                        <FormControl>
                        <Input placeholder={t("urugero: Itumiza #123, Kubonana na muganga", "urugero: Itumiza #123, Kubonana na muganga")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t("Uburyo bwo Kwishyura", "Uburyo bwo Kwishyura")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                            field.onChange(value);
                            form.reset({
                                ...form.getValues(), 
                                paymentMethod: value as PaymentFormValues["paymentMethod"],
                                cardNumber: "", expiryDate: "", cvv: "", cardHolderName: "",
                                mobileNumber: "", mobileProvider: undefined,
                                bankName: undefined, userReference: "",
                            });
                        }}
                        value={field.value} 
                        className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 transition-colors flex-1 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="creditCard" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center cursor-pointer"><CreditCard className="mr-2 h-5 w-5 text-blue-500" /> {t("Ikarita ya Banki", "Ikarita ya Banki")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 transition-colors flex-1 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="mobileMoney" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center cursor-pointer"><Smartphone className="mr-2 h-5 w-5 text-green-500" /> {t("Mobile Money", "Mobile Money")}</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 transition-colors flex-1 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="bankTransfer" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center cursor-pointer"><Landmark className="mr-2 h-5 w-5 text-purple-500" /> {t("Kohereza kuri Banki", "Kohereza kuri Banki")}</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentMethod === 'creditCard' && (
                <div className="space-y-6 p-4 border rounded-md bg-muted/20 dark:bg-muted/10 shadow-inner">
                  <h3 className="text-lg font-medium flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />{t("Amakuru y'Ikarita", "Amakuru y'Ikarita")}</h3>
                  <FormField control={form.control} name="cardHolderName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Izina riri ku Ikarita", "Izina riri ku Ikarita")}</FormLabel>
                      <FormControl><Input placeholder={t("Izina nk'uko rigaragara ku ikarita", "Izina nk'uko rigaragara ku ikarita")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="cardNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Nimero y'Ikarita", "Nimero y'Ikarita")}</FormLabel>
                      <FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="expiryDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Itariki yo Kurangira (UKWEZI/UMWAKA)", "Itariki yo Kurangira (UKWEZI/UMWAKA)")}</FormLabel>
                        <FormControl><Input placeholder="UKWEZI/UMWAKA" {...field} /></FormControl>
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
                <div className="space-y-6 p-4 border rounded-md bg-muted/20 dark:bg-muted/10 shadow-inner">
                   <h3 className="text-lg font-medium flex items-center"><Smartphone className="mr-2 h-5 w-5 text-primary" />{t("Amakuru ya Mobile Money", "Amakuru ya Mobile Money")}</h3>
                  <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Nimero ya Telefone (urugero: 078xxxxxxx)", "Nimero ya Telefone (urugero: 078xxxxxxx)")}</FormLabel>
                      <FormControl><Input type="tel" placeholder={t("Andika nimero ya telefone", "Andika nimero ya telefone")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                   <FormField control={form.control} name="mobileProvider" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Umunyamitwe", "Umunyamitwe")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder={t("Hitamo umunyamitwe wa mobile money", "Hitamo umunyamitwe wa mobile money")} /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="MTN">{t("MTN Mobile Money", "MTN Mobile Money")}</SelectItem>
                            <SelectItem value="Airtel">{t("Airtel Money", "Airtel Money")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                </div>
              )}
              
              {paymentMethod === 'bankTransfer' && (
                 <div className="space-y-6 p-4 border rounded-md bg-muted/20 dark:bg-muted/10 shadow-inner">
                    <h3 className="text-lg font-medium flex items-center"><Landmark className="mr-2 h-5 w-5 text-primary"/>{t("Amakuru yo Kohereza kuri Banki", "Amakuru yo Kohereza kuri Banki")}</h3>
                    <Alert>
                        <AlertTitle className="font-semibold">{t("Amabwiriza yo Kohereza kuri Banki", "Amabwiriza yo Kohereza kuri Banki")}</AlertTitle>
                        <AlertDescription className="text-sm">
                            <p>{t("Nyamuneka ohereza amafaranga kuri:", "Nyamuneka ohereza amafaranga kuri:")}</p>
                            <ul className="list-disc list-inside mt-1">
                                <li>{t("Banki: Banki y'Ikizere ya MediServe", "Banki: Banki y'Ikizere ya MediServe")}</li>
                                <li>{t("Izina rya Konti: MediServe Hub Rwanda Ltd", "Izina rya Konti: MediServe Hub Rwanda Ltd")}</li>
                                <li>{t("Nimero ya Konti:", "Nimero ya Konti:")} <span className="font-mono">1000123456789 RWF</span></li>
                                <li>{t("Swift/BIC:", "Swift/BIC:")} <span className="font-mono">MTRWRW</span></li>
                            </ul>
                            <p className="mt-2">{t("Koresha impamvu y'ubwishyu wanditse haruguru nka referanse y'igikorwa.", "Koresha impamvu y'ubwishyu wanditse haruguru nka referanse y'igikorwa.")}</p>
                        </AlertDescription>
                    </Alert>
                     <FormField control={form.control} name="bankName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Banki Yawe", "Banki Yawe")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder={t("Hitamo banki yawe", "Hitamo banki yawe")} /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="BK">{t("Banki ya Kigali", "Banki ya Kigali")}</SelectItem>
                                <SelectItem value="Equity">{t("Equity Bank", "Equity Bank")}</SelectItem>
                                <SelectItem value="I&M">{t("I&M Bank", "I&M Bank")}</SelectItem>
                                <SelectItem value="Cogebanque">{t("Cogebanque", "Cogebanque")}</SelectItem>
                                <SelectItem value="GTBank">{t("GTBank", "GTBank")}</SelectItem>
                                <SelectItem value="Access">{t("Access Bank", "Access Bank")}</SelectItem>
                                <SelectItem value="Ecobank">{t("Ecobank", "Ecobank")}</SelectItem>
                                <SelectItem value="Urwego">{t("Urwego Bank", "Urwego Bank")}</SelectItem>
                                <SelectItem value="Other">{t("Indi", "Indi")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="userReference" render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t("Referanse y'Igikorwa Cyawe", "Referanse y'Igikorwa Cyawe")}</FormLabel>
                        <FormControl><Input placeholder={t("Andika referanse wakoresheje wohereza", "Andika referanse wakoresheje wohereza")} {...field} /></FormControl>
                        <FormDescription>{t("Andika referanse wakoresheje igihe woherezaga amafaranga kuri banki.", "Andika referanse wakoresheje igihe woherezaga amafaranga kuri banki.")}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}/>
                 </div>
              )}


              <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95 text-lg py-6" disabled={form.formState.isSubmitting || !paymentMethod}>
                {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {t("Gutunganya...", "Gutunganya...")}</> : `${t("Ishyura", "Ishyura")} ${(form.getValues("amount") || 0).toLocaleString()} RWF`}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
```