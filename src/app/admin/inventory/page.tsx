
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Search, Pill, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// Translation helper
const translate = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

interface MedicineStock {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  unitPrice: number; 
  expiryDate: string;
  supplier: string;
}

const initialMockInventory: MedicineStock[] = [
  { id: 'inv1', name: 'Paracetamol 500mg', category: 'Pain Relief', stockLevel: 150, unitPrice: 40, expiryDate: '2025-12-31', supplier: 'PharmaSupply Co.' },
  { id: 'inv2', name: 'Amoxicillin 250mg', category: 'Antibiotics', stockLevel: 80, unitPrice: 150, expiryDate: '2024-10-30', supplier: 'MediGoods Inc.' },
  { id: 'inv3', name: 'Loratadine 10mg', category: 'Allergy Relief', stockLevel: 120, unitPrice: 80, expiryDate: '2026-06-15', supplier: 'HealthFirst Ltd.' },
  { id: 'inv4', name: 'Ibuprofen 200mg', category: 'Pain Relief', stockLevel: 20, unitPrice: 50, expiryDate: '2024-08-20', supplier: 'PharmaSupply Co.' },
  { id: 'inv5', name: 'Vitamin C 1000mg', category: 'Vitamins', stockLevel: 300, unitPrice: 30, expiryDate: '2025-09-01', supplier: 'VitaWell Corp.' },
];

const medicineFormSchema = (lang: 'en' | 'kn') => z.object({
  name: z.string().min(3, { message: translate("Name must be at least 3 characters.", "Izina rigomba kuba nibura inyuguti 3.", lang) }),
  category: z.string().min(3, { message: translate("Category is required.", "Icyiciro kirakenewe.", lang) }),
  stockLevel: z.coerce.number().min(0, { message: translate("Stock level must be 0 or more.", "Umubare w'ububiko ugomba kuba 0 cyangwa urenze.", lang) }),
  unitPrice: z.coerce.number().min(1, { message: translate("Unit price must be at least 1.", "Igiciro cy'igice kigomba kuba nibura 1.", lang) }),
  expiryDate: z.string().refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: translate("Invalid date format (YYYY-MM-DD).", "Uburyo bw'itariki ntabwo ari bwo (UMWAKA-UKWEZI-UMUNSI).", lang) }),
  supplier: z.string().min(2, { message: translate("Supplier name is required.", "Izina ry'uwagitanze rirakenewe.", lang) }),
});

type MedicineFormValues = z.infer<ReturnType<typeof medicineFormSchema>>;

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [inventoryList, setInventoryList] = useState<MedicineStock[]>(initialMockInventory);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineStock | null>(null);
  
  const t = (enText: string, knText: string) => translate(enText, knText, currentLanguage);

  useEffect(() => {
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);
  
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema(currentLanguage)),
    defaultValues: { name: '', category: '', stockLevel: 0, unitPrice: 0, expiryDate: '', supplier: '' },
  });

  useEffect(() => {
    if (editingMedicine) {
      form.reset(editingMedicine);
    } else {
      form.reset({ name: '', category: '', stockLevel: 0, unitPrice: 0, expiryDate: '', supplier: '' });
    }
  }, [editingMedicine, form, isFormDialogOpen]);

  const filteredInventory = inventoryList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSubmit = (data: MedicineFormValues) => {
    if (editingMedicine) {
      setInventoryList(prev => prev.map(med => med.id === editingMedicine.id ? { ...editingMedicine, ...data } : med));
      toast({ title: t("Medicine Updated", "Umuti Wahinduwe"), description: t(`${data.name} has been updated. (Mock)`, `${data.name} wahinduwe. (Agateganyo)`)});
    } else {
      const newMedicine: MedicineStock = { ...data, id: `inv${Date.now()}` };
      setInventoryList(prev => [newMedicine, ...prev]);
      toast({ title: t("Medicine Added", "Umuti Wongeweho"), description: t(`${data.name} has been added to the list. (Mock)`, `${data.name} wongeweho ku rutonde. (Agateganyo)`)});
    }
    setIsFormDialogOpen(false);
    setEditingMedicine(null);
  };

  const handleOpenDialog = (medicine: MedicineStock | null = null) => {
    setEditingMedicine(medicine);
    setIsFormDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    // In a real app, this would make an API call. Here, we just show a toast.
    // Optionally, filter the list client-side:
    // setInventoryList(prev => prev.filter(item => item.id !== itemId));
    toast({ variant: "destructive", title: t("Item Deletion (Mock)", "Gusiba Ikintu (Agateganyo)"), description: t(`${itemName} would be deleted from the inventory.`, `${itemName} yaba yakuwe mu bubiko.`)});
  };
  
  const handleEditItem = (item: MedicineStock) => {
    setEditingMedicine(item);
    setIsFormDialogOpen(true);
  };


  return (
    <AppLayout>
      <PageHeader 
        title={t("Manage Medicine Inventory", "Gucunga Ububiko bw'Imiti")} 
        breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe"), href: "/"}, 
            {label: t("Admin", "Ubuyobozi"), href: "/admin/dashboard"}, 
            {label: t("Inventory", "Ububiko")}
        ]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={t("Search inventory...", "Shakisha mu bubiko...")} 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="transition-transform hover:scale-105 active:scale-95">
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add New Medicine", "Ongeraho Umuti Mushya")}
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-5 w-5 text-primary" />{t("Current Stock", "Ububiko Burimo")}</CardTitle>
          <CardDescription>{t("View, update, or remove items from the medicine inventory. Changes are mock and client-side only.", "Reba, hindura, cyangwa ukure ibintu mu bubiko bw'imiti. Impinduka ni iz'ikitegererezo kandi zibera ku ruhande rw'umukoresha gusa.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name", "Izina")}</TableHead>
                <TableHead>{t("Category", "Icyiciro")}</TableHead>
                <TableHead className="text-right">{t("Stock Level", "Umubare w'Ububiko")}</TableHead>
                <TableHead className="text-right">{t("Unit Price (RWF)", "Igiciro cy'Igice (RWF)")}</TableHead>
                <TableHead>{t("Expiry Date", "Itariki yo Kurangira")}</TableHead>
                <TableHead>{t("Supplier", "Uwagitanze")}</TableHead>
                <TableHead>{t("Actions", "Ibikorwa")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.stockLevel < 50 ? 'destructive' : 'default'}>{item.stockLevel}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label={t("Edit item", "Hindura ikintu")} onClick={() => handleEditItem(item)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label={t("Delete item", "Siba ikintu")} onClick={() => handleDeleteItem(item.id, item.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredInventory.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t("No inventory items found matching your search.", "Nta bintu byo mu bubiko bihuye n'ubushakashatsi bwawe byabonetse.")}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? t('Edit Medicine', 'Hindura Umuti') : t('Add New Medicine', 'Ongeraho Umuti Mushya')}</DialogTitle>
            <DialogDescription>
              {editingMedicine ? t("Update the medicine details.", "Hindura amakuru y'umuti.") : t("Fill in the details to add a new medicine to the inventory. (Mock)", "Uzuza amakuru kugirango wongere umuti mushya mu bubiko. (Agateganyo)")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div><Label htmlFor="name">{t("Medicine Name", "Izina ry'Umuti")}</Label><Input id="name" {...form.register("name")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.name?.message}</p></div>
            <div><Label htmlFor="category">{t("Category", "Icyiciro")}</Label><Input id="category" {...form.register("category")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.category?.message}</p></div>
            <div><Label htmlFor="stockLevel">{t("Stock Level", "Umubare w'Ububiko")}</Label><Input id="stockLevel" type="number" {...form.register("stockLevel")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.stockLevel?.message}</p></div>
            <div><Label htmlFor="unitPrice">{t("Unit Price (RWF)", "Igiciro cy'Igice (RWF)")}</Label><Input id="unitPrice" type="number" {...form.register("unitPrice")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.unitPrice?.message}</p></div>
            <div><Label htmlFor="expiryDate">{t("Expiry Date", "Itariki yo Kurangira")}</Label><Input id="expiryDate" type="date" {...form.register("expiryDate")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.expiryDate?.message}</p></div>
            <div><Label htmlFor="supplier">{t("Supplier", "Uwagitanze")}</Label><Input id="supplier" {...form.register("supplier")} className="mt-1" /><p className="text-sm text-destructive mt-1">{form.formState.errors.supplier?.message}</p></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>{t("Cancel", "Hagarika")}</Button>
              <Button type="submit" className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" /> {editingMedicine ? t('Save Changes', 'Bika Impinduka') : t('Add Medicine', 'Ongeraho Umuti')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
