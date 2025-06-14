
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Search, ListOrdered, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';


// Translation helper
const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

type ServiceType = 'Medical Test' | 'Consultation' | 'Procedure';
type ServiceTypeKn = 'Igipimo cya Muganga' | 'Kubonana na Muganga' | 'Uburyo bwo Kuvura';

interface ServiceItem {
  id: string;
  name: string;
  nameKn: string;
  type: ServiceType;
  typeKn: ServiceTypeKn;
  price: number; // Price in RWF
  duration?: string; 
  durationKn?: string;
  isActive: boolean;
}

const initialMockServices: ServiceItem[] = [
  { id: 'svc1', name: 'Complete Blood Count (CBC)', nameKn: 'Isuzuma ryuzuye ry\'amaraso (CBC)', type: 'Medical Test', typeKn: 'Igipimo cya Muganga', price: 7500, duration: 'Results in 24h', durationKn: 'Ibisubizo mu masaha 24', isActive: true },
  { id: 'svc2', name: 'General Consultation', nameKn: 'Kubonana na Muganga Rusange', type: 'Consultation', typeKn: 'Kubonana na Muganga', price: 5000, duration: '30 minutes', durationKn: 'Iminota 30', isActive: true },
  { id: 'svc3', name: 'Lipid Panel Test', nameKn: 'Igipimo cy\'ibinure mu maraso', type: 'Medical Test', typeKn: 'Igipimo cya Muganga', price: 12000, duration: 'Results in 48h', durationKn: 'Ibisubizo mu masaha 48', isActive: true },
  { id: 'svc4', name: 'Specialist Consultation - Cardiology', nameKn: 'Kubonana n\'inzobere - Indwara z\'Umutima', type: 'Consultation', typeKn: 'Kubonana na Muganga', price: 15000, duration: '45 minutes', durationKn: 'Iminota 45', isActive: false },
  { id: 'svc5', name: 'Minor Wound Dressing', nameKn: 'Gupfuka Igikomere Gito', type: 'Procedure', typeKn: 'Uburyo bwo Kuvura', price: 3000, duration: '15 minutes', durationKn: 'Iminota 15', isActive: true },
];

const serviceTypeValues: ServiceType[] = ['Medical Test', 'Consultation', 'Procedure'];
const serviceTypeKnValues: ServiceTypeKn[] = ['Igipimo cya Muganga', 'Kubonana na Muganga', 'Uburyo bwo Kuvura'];

const serviceFormSchema = (lang: 'en' | 'kn') => z.object({
  name: z.string().min(3, { message: translate("Service name must be at least 3 characters.", "Izina rya serivisi rigomba kuba nibura inyuguti 3.", lang) }),
  nameKn: z.string().min(3, { message: translate("Service Kinyarwanda name must be at least 3 characters.", "Izina rya serivisi mu Kinyarwanda rigomba kuba nibura inyuguti 3.", lang) }),
  type: z.enum(serviceTypeValues, { required_error: translate("Service type is required.", "Ubwoko bwa serivisi burakenewe.", lang) }),
  price: z.coerce.number().min(0, { message: translate("Price must be 0 or more.", "Igiciro kigomba kuba 0 cyangwa kirenze.", lang) }),
  duration: z.string().optional(),
  durationKn: z.string().optional(),
  isActive: z.boolean(),
});

type ServiceFormValues = z.infer<ReturnType<typeof serviceFormSchema>>;

export default function AdminServicesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [servicesList, setServicesList] = useState<ServiceItem[]>(initialMockServices);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  useEffect(() => {
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema(currentLanguage)),
    defaultValues: { name: '', nameKn: '', type: 'Medical Test', price: 0, duration: '', durationKn: '', isActive: true },
  });

  useEffect(() => {
    if (editingService) {
      form.reset(editingService);
    } else {
      form.reset({ name: '', nameKn: '', type: 'Medical Test', price: 0, duration: '', durationKn: '', isActive: true });
    }
  }, [editingService, form, isFormDialogOpen]);

  const filteredServices = servicesList.filter(service => 
    (currentLanguage === 'kn' ? service.nameKn : service.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (currentLanguage === 'kn' ? service.typeKn : service.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSubmit = (data: ServiceFormValues) => {
    const typeKn = serviceTypeKnValues[serviceTypeValues.indexOf(data.type)] || data.type;
    if (editingService) {
      setServicesList(prev => prev.map(svc => svc.id === editingService.id ? { ...editingService, ...data, typeKn } : svc));
      toast({ title: t("Service Updated", "Serivisi Yahinduwe"), description: t(`${data.name} has been updated. (Mock)`, `${data.name} yahinduwe. (Agateganyo)`) });
    } else {
      const newService: ServiceItem = { ...data, typeKn, id: `svc${Date.now()}` };
      setServicesList(prev => [newService, ...prev]);
      toast({ title: t("Service Added", "Serivisi Yongeweho"), description: t(`${data.name} has been added to the list. (Mock)`, `${data.name} yongeweho ku rutonde. (Agateganyo)`) });
    }
    setIsFormDialogOpen(false);
    setEditingService(null);
  };

  const handleOpenDialog = (service: ServiceItem | null = null) => {
    setEditingService(service);
    setIsFormDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    toast({ variant: "destructive", title: t("Service Deletion (Mock)", "Gusiba Serivisi (Agateganyo)"), description: t(`${itemName} would be deleted.`, `${itemName} yaba yasibwe.`)});
  };

  const handleEditItem = (item: ServiceItem) => {
    setEditingService(item);
    setIsFormDialogOpen(true);
  };

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
          <CardDescription>{t("Manage medical tests, consultations, and other services offered. Changes are mock and client-side only.", "Gucunga ibipimo bya muganga, kubonana na muganga, n'izindi serivisi zitangwa. Impinduka ni iz'ikitegererezo kandi zibera ku ruhande rw'umukoresha gusa.")}</CardDescription>
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
                  <TableCell className="font-medium">{currentLanguage === 'kn' ? service.nameKn : service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{currentLanguage === 'kn' ? service.typeKn : service.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{service.price.toLocaleString()}</TableCell>
                  <TableCell>{(currentLanguage === 'kn' ? service.durationKn : service.duration) || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={service.isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}>
                      {service.isActive ? t('Active', 'Kirakora') : t('Inactive', 'Ntikirakora')}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label={t("Edit service", "Hindura serivisi")} onClick={() => handleEditItem(service)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label={t("Delete service", "Siba serivisi")} onClick={() => handleDeleteItem(service.id, currentLanguage === 'kn' ? service.nameKn : service.name)}>
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
              {editingService ? t("Update the service details.", "Hindura amakuru ya serivisi.") : t("Fill in the details to add a new service. (Mock)", "Uzuza amakuru kugirango wongere serivisi nshya. (Agateganyo)")}
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
                                    <SelectItem key={typeVal} value={typeVal}>{currentLanguage === 'kn' ? serviceTypeKnValues[index] : typeVal}</SelectItem>
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
              <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>{t("Cancel", "Hagarika")}</Button>
              <Button type="submit" className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" /> {editingService ? t('Save Changes', 'Bika Impinduka') : t('Add Service', 'Ongeraho Serivisi')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
