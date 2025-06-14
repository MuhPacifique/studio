"use client";

import React from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Search, Pill } from 'lucide-react';

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
  { id: 'inv1', name: 'Paracetamol 500mg', category: 'Pain Relief', stockLevel: 150, unitPrice: 0.04, expiryDate: '2025-12-31', supplier: 'PharmaSupply Co.' },
  { id: 'inv2', name: 'Amoxicillin 250mg', category: 'Antibiotics', stockLevel: 80, unitPrice: 0.15, expiryDate: '2024-10-30', supplier: 'MediGoods Inc.' },
  { id: 'inv3', name: 'Loratadine 10mg', category: 'Allergy Relief', stockLevel: 120, unitPrice: 0.08, expiryDate: '2026-06-15', supplier: 'HealthFirst Ltd.' },
  { id: 'inv4', name: 'Ibuprofen 200mg', category: 'Pain Relief', stockLevel: 20, unitPrice: 0.05, expiryDate: '2024-08-20', supplier: 'PharmaSupply Co.' },
  { id: 'inv5', name: 'Vitamin C 1000mg', category: 'Vitamins', stockLevel: 300, unitPrice: 0.03, expiryDate: '2025-09-01', supplier: 'VitaWell Corp.' },
];

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredInventory = mockInventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader 
        title="Manage Medicine Inventory" 
        breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Admin", href: "/admin/dashboard"}, {label: "Inventory"}]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search inventory..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Medicine
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-5 w-5 text-primary" />Current Stock</CardTitle>
          <CardDescription>View, update, or remove items from the medicine inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead className="text-right">Unit Price ($)</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label="Edit item">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label="Delete item">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredInventory.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No inventory items found matching your search.</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
