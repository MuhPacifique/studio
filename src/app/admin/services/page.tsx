"use client";

import React from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Search, Stethoscope, ListOrdered } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  type: 'Medical Test' | 'Consultation' | 'Procedure';
  price: number;
  duration?: string; // e.g. "30 minutes", "24-48 hours for results"
  isActive: boolean;
}

const mockServices: ServiceItem[] = [
  { id: 'svc1', name: 'Complete Blood Count (CBC)', type: 'Medical Test', price: 75.00, duration: 'Results in 24h', isActive: true },
  { id: 'svc2', name: 'General Consultation', type: 'Consultation', price: 50.00, duration: '30 minutes', isActive: true },
  { id: 'svc3', name: 'Lipid Panel Test', type: 'Medical Test', price: 120.00, duration: 'Results in 48h', isActive: true },
  { id: 'svc4', name: 'Specialist Consultation - Cardiology', type: 'Consultation', price: 150.00, duration: '45 minutes', isActive: false },
  { id: 'svc5', name: 'Minor Wound Dressing', type: 'Procedure', price: 30.00, duration: '15 minutes', isActive: true },
];

export default function AdminServicesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredServices = mockServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader 
        title="Manage Services" 
        breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Admin", href: "/admin/dashboard"}, {label: "Services"}]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search services..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><ListOrdered className="mr-2 h-5 w-5 text-primary" />Service Listings</CardTitle>
          <CardDescription>Manage medical tests, consultations, and other services offered.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price ($)</TableHead>
                <TableHead>Duration / Turnaround</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{service.price.toFixed(2)}</TableCell>
                  <TableCell>{service.duration || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={service.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label="Edit service">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label="Delete service">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredServices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No services found matching your search.</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
