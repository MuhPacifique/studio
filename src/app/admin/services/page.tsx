
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Search, ListOrdered, Save, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const t = (enText: string, knText: string) => knText; 

type ServiceType = 'Medical Test' | 'Consultation' | 'Procedure';
type ServiceTypeKn = 'Igipimo cya Muganga' | 'Kubonana na Muganga' | 'Uburyo bwo Kuvura';

interface ServiceItem {
  id: string;
  name: string;
  nameKn: string;
  type: ServiceType;
  typeKn: ServiceTypeKn;
  price: number; 
  duration?: string; 
  durationKn?: string;
  isActive: boolean;
}

// Mock initial data - will not persist after page reload.
const initialMockServices: ServiceItem[] = [
  { id: 'svc1', name: 'Complete Blood Count (CBC)', nameKn: 'Isuzuma ryuzuye ry\'amaraso (CBC)', type: 'Medical Test', typeKn: 'Igipimo cya Muganga', price: 7500, duration: 'Results in 24h', durationKn: 'Ibisubizo mu masaha 24', isActive: true },
  { id: 'svc2', name: 'General Consultation', nameKn: 'Kubonana na Muganga Rusange', type: 'Consultation', typeKn: 'Kubonana na Muganga', price: 5000, duration: '30 minutes', durationKn: 'Iminota 30', isActive: true },
];

const serviceTypeValues: ServiceType[] = ['Medical Test', 'Consultation', 'Procedure'];
const serviceTypeKnValues: ServiceTypeKn[] = ['Igipimo cya Muganga', 'Kubonana na Muganga', 'Uburyo bwo Kuvura'];

const serviceFormSchema = z.object({
  name: z.string().min(3, { message: t("Izina rya serivisi rigomba kuba nibura inyuguti 3.", "Izina rya serivisi rigomba kuba nibura inyuguti 3.") }),
  nameKn: z.string().min(3, { message: t("Izina rya serivisi mu Kinyarwanda rigomba kuba nibura inyuguti 3.", "Izina rya serivisi mu Kinyarwanda rigomba kuba nibura inyuguti 3.") }),
  type: z.enum(serviceTypeValues, { required_error: t("Ubwoko bwa serivisi burakenewe.", "Ubwoko bwa serivisi burakenewe.") }),
  price: z.coerce.number().min(0, { message: t("Igiciro kigomba kuba 0 cyangwa kirenze.", "Igiciro kigomba kuba 0 cyangwa kirenze.") }),
  duration: z.string().optional(),
  durationKn: z.string().optional(),
  isActive: z.boolean(),
});

type ServiceFormValues = z.infer<ReturnType<typeof serviceFormSchema>>;

export default function AdminServicesPage() {
  const { toast } = useToast();
  const router = useRouter(); // Kept for potential future use
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  // Assume if user reaches this page, they are an "authenticated admin" for prototype purposes.
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(true); 

  const [searchTerm, setSearchTerm] = useState('');
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]); 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    // Simulate fetching initial data. No localStorage means data resets on reload.
    setServicesList(initialMockServices);
    setIsLoadingPage(false);
  }, []);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: { name: '', nameKn: '', type: 'Medical Test', price: 0, duration: '', durationKn: '', isActive: true },
  });

  useEffect(() => {
    if (editingService) {
      form.reset(editingService);
    } else {
      form.reset({ name: '', nameKn: '', type: 'Medical Test', price: 0, duration: '', durationKn: '', isActive: true });
    }
  }, [editingService, form]);

  const filteredServices = servicesList.filter(service => 
    (service.nameKn).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.typeKn).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSubmit = (data: ServiceFormValues) => {
    const typeKn = serviceTypeKnValues[serviceTypeValues.indexOf(data.type)] || data.type;
    // UI update is ephemeral, backend would handle persistence
    if (editingService) {
      setServicesList(prev => prev.map(svc => svc.id === editingService.id ? { ...editingService, ...data, typeKn } : svc));
      toast({ title: t("Serivisi Yahinduwe (Igerageza)", "Serivisi Yahinduwe (Igerageza)"), description: t(`${data.name} yahinduwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`, `${data.name} yahinduwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`) });
    } else {
      const newService: ServiceItem = { ...data, typeKn, id: `svc${Date.now()}` };
      setServicesList(prev => [newService, ...prev]);
      toast({ title: t("Serivisi Yongeweho (Igerageza)", "Serivisi Yongeweho (Igerageza)"), description: t(`${data.name} yongeweho ku rutonde. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`, `${data.name} yongeweho ku rutonde. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`) });
    }
    setIsFormDialogOpen(false);
    setEditingService(null);
    form.reset();
  };

  const handleOpenDialog = (service: ServiceItem | null = null) => {
    setEditingService(service);
    setIsFormDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    // UI update is ephemeral
    setServicesList(prev => prev.filter(item => item.id !== itemId));
    toast({ variant: "destructive", title: t("Gusiba Serivisi (Igerageza)", "Gusiba Serivisi (Igerageza)"), description: t(`${itemName} yakuwe ku rutonde. Gusiba nyako bisaba seriveri.`, `${itemName} yakuwe ku rutonde. Gusiba nyako bisaba seriveri.`)});
  };

  const handleEditItem = (item: ServiceItem) => {
    handleOpenDialog(item);
  };

  if (isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Manage Services", "Gucunga Serivisi")} />
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t("Loading services...", "Gutegura serivisi...")}</p>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticatedAdmin) {
    toast({ variant: "destructive", title: t("Access Denied", "Ntabwo Wemerewe") });
    return <AppLayout><PageHeader title={t("Access Denied", "Ntabwo Wemerewe")} /></AppLayout>;
  }


  return (
    <AppLayout>
      <PageHeader 
        title={t("Manage Services", "Gucunga Serivisi")} 
        breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Admin", "Ubuyobozi"), href: "/admin/dashboard"}, 
            {label: t("Services", "Serivisi")}
        ]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={t("Search services...", "Shakisha serivisi...")} 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="transition-transform hover:scale-105 active:scale-95">
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add New Service", "Ongeraho Serivisi Nshya")}
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><ListOrdered className="mr-2 h-5 w-5 text-primary" />{t("Service Listings", "Urutonde rwa Serivisi")}</CardTitle>
          <CardDescription>{t("Manage medical tests, consultations, and other services. Changes are illustrative and require backend integration.", "Gucunga ibipimo bya muganga, kubonana na muganga, n'izindi serivisi. Impinduka ni iz'ikitegererezo kandi zisaba guhuzwa na seriveri.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Service Name", "Izina rya Serivisi")}</TableHead>
                <TableHead>{t("Type", "Ubwoko")}</TableHead>
                <TableHead className="text-right">{t("Price (RWF)", "Igiciro (RWF)")}</TableHead>
                <TableHead>{t("Duration / Turnaround", "Igihe / Kubona Ibisubizo")}</TableHead>
                <TableHead>{t("Status", " uko Bihagaze")}</TableHead>
                <TableHead>{t("Actions", "Ibikorwa")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.nameKn}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.typeKn}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{service.price.toLocaleString()}</TableCell>
                  <TableCell>{service.durationKn || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={service.isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}>
                      {service.isActive ? t('Active', 'Kirakora') : t('Inactive', 'Ntikirakora')}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label={t("Edit service", "Hindura serivisi")} onClick={() => handleEditItem(service)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label={t("Delete service", "Siba serivisi")} onClick={() => handleDeleteItem(service.id, service.nameKn)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredServices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t("No services found matching your search.", "Nta serivisi zihuye n'ubushakashatsi bwawe zabonetse.")}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingService ? t('Edit Service', 'Hindura Serivisi') : t('Add New Service', 'Ongeraho Serivisi Nshya')}</DialogTitle>
            <DialogDescription>
              {editingService ? t("Update the service details. (Mock - backend needed)", "Hindura amakuru ya serivisi. (Igerageza - seriveri irakenewe)") : t("Fill in the details to add a new service. (Mock - backend needed)", "Uzuza amakuru kugirango wongere serivisi nshya. (Igerageza - seriveri irakenewe)")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div><Label htmlFor="name">{t("Service Name (English)", "Izina rya Serivisi (Icyongereza)")}</Label><Input id="name" {...form.register("name")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.name?.message}</p></div>
            <div><Label htmlFor="nameKn">{t("Service Name (Kinyarwanda)", "Izina rya Serivisi (Kinyarwanda)")}</Label><Input id="nameKn" {...form.register("nameKn")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.nameKn?.message}</p></div>
            <div>
                <Label htmlFor="type">{t("Service Type", "Ubwoko bwa Serivisi")}</Label>
                <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="type" className="w-full mt-1"><SelectValue placeholder={t("Select service type", "Hitamo ubwoko bwa serivisi")} /></SelectTrigger>
                            <SelectContent>
                                {serviceTypeValues.map((typeVal, index) => (
                                    <SelectItem key={typeVal} value={typeVal}>{serviceTypeKnValues[index]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                <p className="text-sm text-destructive mt-1">{form.formState.errors.type?.message}</p>
            </div>
            <div><Label htmlFor="price">{t("Price (RWF)", "Igiciro (RWF)")}</Label><Input id="price" type="number" {...form.register("price")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.price?.message}</p></div>
            <div><Label htmlFor="duration">{t("Duration / Turnaround (English)", "Igihe / Kubona Ibisubizo (Icyongereza)")}</Label><Input id="duration" {...form.register("duration")} className="mt-1" placeholder={t("e.g., 30 minutes, 24 hours", "urugero: iminota 30, amasaha 24")} /><p className="text-sm text-destructive mt-1">{form.formState.errors.duration?.message}</p></div>
            <div><Label htmlFor="durationKn">{t("Duration / Turnaround (Kinyarwanda)", "Igihe / Kubona Ibisubizo (Kinyarwanda)")}</Label><Input id="durationKn" {...form.register("durationKn")} className="mt-1" placeholder={t("urugero: iminota 30, amasaha 24", "urugero: iminota 30, amasaha 24")} /><p className="text-sm text-destructive mt-1">{form.formState.errors.durationKn?.message}</p></div>
            <div className="flex items-center space-x-2 pt-2">
                 <Controller
                    name="isActive"
                    control={form.control}
                    render={({ field }) => ( <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} /> )}
                />
                <Label htmlFor="isActive">{t("Service is Active", "Serivisi Irakora")}</Label>
            </div>
             <p className="text-sm text-destructive mt-1">{form.formState.errors.isActive?.message}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsFormDialogOpen(false); setEditingService(null); form.reset(); }}>{t("Cancel", "Hagarika")}</Button>
              <Button type="submit" className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" /> {editingService ? t('Save Changes', 'Bika Impinduka') : t('Add Service', 'Ongeraho Serivisi')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
```