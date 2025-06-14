
"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit3, Trash2, Search, ListOrdered } from 'lucide-react';

// Translation helper
const t = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

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

const mockServices: ServiceItem[] = [
  { id: 'svc1', name: 'Complete Blood Count (CBC)', nameKn: 'Isuzuma ryuzuye ry\'amaraso (CBC)', type: 'Medical Test', typeKn: 'Igipimo cya Muganga', price: 7500, duration: 'Results in 24h', durationKn: 'Ibisubizo mu masaha 24', isActive: true },
  { id: 'svc2', name: 'General Consultation', nameKn: 'Kubonana na Muganga Rusange', type: 'Consultation', typeKn: 'Kubonana na Muganga', price: 5000, duration: '30 minutes', durationKn: 'Iminota 30', isActive: true },
  { id: 'svc3', name: 'Lipid Panel Test', nameKn: 'Igipimo cy\'ibinure mu maraso', type: 'Medical Test', typeKn: 'Igipimo cya Muganga', price: 12000, duration: 'Results in 48h', durationKn: 'Ibisubizo mu masaha 48', isActive: true },
  { id: 'svc4', name: 'Specialist Consultation - Cardiology', nameKn: 'Kubonana n\'inzobere - Indwara z\'Umutima', type: 'Consultation', typeKn: 'Kubonana na Muganga', price: 15000, duration: '45 minutes', durationKn: 'Iminota 45', isActive: false },
  { id: 'svc5', name: 'Minor Wound Dressing', nameKn: 'Gupfuka Igikomere Gito', type: 'Procedure', typeKn: 'Uburyo bwo Kuvura', price: 3000, duration: '15 minutes', durationKn: 'Iminota 15', isActive: true },
];

export default function AdminServicesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');

  useEffect(() => {
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);
  
  const filteredServices = mockServices.filter(service => 
    (currentLanguage === 'kn' ? service.nameKn : service.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (currentLanguage === 'kn' ? service.typeKn : service.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader 
        title={t("Manage Services", "Gucunga Serivisi", currentLanguage)} 
        breadcrumbs={[
            {label: t("Dashboard", "Imbonerahamwe", currentLanguage), href: "/"}, 
            {label: t("Admin", "Ubuyobozi", currentLanguage), href: "/admin/dashboard"}, 
            {label: t("Services", "Serivisi", currentLanguage)}
        ]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={t("Search services...", "Shakisha serivisi...", currentLanguage)} 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add New Service", "Ongeraho Serivisi Nshya", currentLanguage)}
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><ListOrdered className="mr-2 h-5 w-5 text-primary" />{t("Service Listings", "Urutonde rwa Serivisi", currentLanguage)}</CardTitle>
          <CardDescription>{t("Manage medical tests, consultations, and other services offered.", "Gucunga ibipimo bya muganga, kubonana na muganga, n'izindi serivisi zitangwa.", currentLanguage)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Service Name", "Izina rya Serivisi", currentLanguage)}</TableHead>
                <TableHead>{t("Type", "Ubwoko", currentLanguage)}</TableHead>
                <TableHead className="text-right">{t("Price (RWF)", "Igiciro (RWF)", currentLanguage)}</TableHead>
                <TableHead>{t("Duration / Turnaround", "Igihe / Kubona Ibisubizo", currentLanguage)}</TableHead>
                <TableHead>{t("Status", " uko Bihagaze", currentLanguage)}</TableHead>
                <TableHead>{t("Actions", "Ibikorwa", currentLanguage)}</TableHead>
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
                      {service.isActive ? t('Active', 'Kirakora', currentLanguage) : t('Inactive', 'Ntikirakora', currentLanguage)}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label={t("Edit service", "Hindura serivisi", currentLanguage)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label={t("Delete service", "Siba serivisi", currentLanguage)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredServices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t("No services found matching your search.", "Nta serivisi zihuye n'ubushakashatsi bwawe zabonetse.", currentLanguage)}</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
