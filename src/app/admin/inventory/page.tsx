
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Search, Pill } from 'lucide-react';

// Translation helper
const t = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

interface MedicineStock {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  unitPrice: number; 
  expiryDate: string;
  supplier: string;
}

const mockInventory: MedicineStock[] = [
  { id: 'inv1', name: 'Paracetamol 500mg', category: 'Pain Relief', stockLevel: 150, unitPrice: 40, expiryDate: '2025-12-31', supplier: 'PharmaSupply Co.' },
  { id: 'inv2', name: 'Amoxicillin 250mg', category: 'Antibiotics', stockLevel: 80, unitPrice: 150, expiryDate: '2024-10-30', supplier: 'MediGoods Inc.' },
  { id: 'inv3', name: 'Loratadine 10mg', category: 'Allergy Relief', stockLevel: 120, unitPrice: 80, expiryDate: '2026-06-15', supplier: 'HealthFirst Ltd.' },
  { id: 'inv4', name: 'Ibuprofen 200mg', category: 'Pain Relief', stockLevel: 20, unitPrice: 50, expiryDate: '2024-08-20', supplier: 'PharmaSupply Co.' },
  { id: 'inv5', name: 'Vitamin C 1000mg', category: 'Vitamins', stockLevel: 300, unitPrice: 30, expiryDate: '2025-09-01', supplier: 'VitaWell Corp.' },
];

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  useEffect(() => {
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);
  
  const filteredInventory = mockInventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader 
        title={t("Manage Medicine Inventory", "Gucunga Ububiko bw'Imiti", currentLanguage)} 
        breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe", currentLanguage), href: "/"}, 
            {label: t("Admin", "Ubuyobozi", currentLanguage), href: "/admin/dashboard"}, 
            {label: t("Inventory", "Ububiko", currentLanguage)}
        ]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={t("Search inventory...", "Shakisha mu bubiko...", currentLanguage)} 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add New Medicine", "Ongeraho Umuti Mushya", currentLanguage)}
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-5 w-5 text-primary" />{t("Current Stock", "Ububiko Burimo", currentLanguage)}</CardTitle>
          <CardDescription>{t("View, update, or remove items from the medicine inventory.", "Reba, hindura, cyangwa ukure ibintu mu bubiko bw'imiti.", currentLanguage)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name", "Izina", currentLanguage)}</TableHead>
                <TableHead>{t("Category", "Icyiciro", currentLanguage)}</TableHead>
                <TableHead className="text-right">{t("Stock Level", "Umubare w'Ububiko", currentLanguage)}</TableHead>
                <TableHead className="text-right">{t("Unit Price (RWF)", "Igiciro cy'Igice (RWF)", currentLanguage)}</TableHead>
                <TableHead>{t("Expiry Date", "Itariki yo Kurangira", currentLanguage)}</TableHead>
                <TableHead>{t("Supplier", "Uwagitanze", currentLanguage)}</TableHead>
                <TableHead>{t("Actions", "Ibikorwa", currentLanguage)}</TableHead>
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
                    <Button variant="outline" size="icon" aria-label={t("Edit item", "Hindura ikintu", currentLanguage)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label={t("Delete item", "Siba ikintu", currentLanguage)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredInventory.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t("No inventory items found matching your search.", "Nta bintu byo mu bubiko bihuye n'ubushakashatsi bwawe byabonetse.", currentLanguage)}</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
