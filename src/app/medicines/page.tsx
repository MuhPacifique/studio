
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, PlusCircle, MinusCircle, Trash2, Loader2, ListFilter, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const t = (enText: string, knText: string) => knText; 

interface Medicine {
  id: string;
  name: string;
  nameKn: string;
  description: string;
  descriptionKn: string;
  price: number; 
  imageUrl: string;
  category: string;
  categoryKn: string;
  stock: number;
  aiHint: string;
}

// Mock data - will not persist after page reload.
const mockMedicinesData: Medicine[] = [
  { id: 'med1', name: 'Paracetamol 500mg', nameKn: 'Parasetamoli 500mg', description: 'Relieves pain and fever.', descriptionKn: 'Igabanya ububabare n\'umuriro.', price: 599, imageUrl: 'https://placehold.co/300x200.png', category: 'Pain Relief', categoryKn: 'Igabanya Ububabare', stock: 150, aiHint: 'pills medication' },
  { id: 'med2', name: 'Amoxicillin 250mg', nameKn: 'Amogisiline 250mg', description: 'Antibiotic for bacterial infections.', descriptionKn: 'Antibiyotike y\'indwara ziterwa na bagiteri.', price: 1250, imageUrl: 'https://placehold.co/300x200.png', category: 'Antibiotics', categoryKn: 'Antibiyotike', stock: 80, aiHint: 'capsules pharmacy' },
  { id: 'med3', name: 'Loratadine 10mg', nameKn: 'Loratadine 10mg', description: 'Antihistamine for allergies.', descriptionKn: 'Antihistaminike ya aleriji.', price: 875, imageUrl: 'https://placehold.co/300x200.png', category: 'Allergy Relief', categoryKn: 'Igabanya Aleriji', stock: 120, aiHint: 'tablets allergy' },
  { id: 'med4', name: 'Ibuprofen 200mg', nameKn: 'Ibiprofene 200mg', description: 'Anti-inflammatory drug.', descriptionKn: 'Umuti ugabanya ububyimbe.', price: 720, imageUrl: 'https://placehold.co/300x200.png', category: 'Pain Relief', categoryKn: 'Igabanya Ububabare', stock: 0, aiHint: 'medicine painkiller' }, 
  { id: 'med5', name: 'Vitamin C 1000mg', nameKn: 'Vitamini C 1000mg', description: 'Immune system support.', descriptionKn: 'Ifasha ubudahangarwa bw\'umubiri.', price: 1000, imageUrl: 'https://placehold.co/300x200.png', category: 'Vitamins', categoryKn: 'Vitamini', stock: 300, aiHint: 'supplements health' },
];

interface CartItemClient extends Medicine { 
  quantity: number;
}

interface OrderClient { 
  id: string;
  date: string;
  items: CartItemClient[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered'; 
}

// Mock data - will not persist after page reload.
const mockOrdersClient: OrderClient[] = [ 
  { id: 'order1', date: '2024-07-15', items: [{ ...mockMedicinesData[0], quantity: 2 }, { ...mockMedicinesData[2], quantity: 1 }], total: (599*2) + 875, status: 'Delivered' },
  { id: 'order2', date: '2024-07-28', items: [{ ...mockMedicinesData[1], quantity: 1 }], total: 1250, status: 'Processing' },
];

const medicineCategoriesKn = Array.from(new Set(mockMedicinesData.map(m => m.categoryKn)));


export default function MedicinesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  // Assume not authenticated until backend confirms.
  // AppLayout will handle redirection if this page is accessed without auth.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItemClient[]>([]); // Cart is ephemeral
  const [medicines, setMedicines] = useState<Medicine[]>([]); // Medicines list is ephemeral
  const [orders, setOrders] = useState<OrderClient[]>([]); // Orders list is ephemeral


  useEffect(() => {
    setIsClient(true);
    // Simulate fetching initial data. No localStorage means data resets on reload.
    setMedicines(mockMedicinesData); 
    setOrders(mockOrdersClient);     
    setIsLoadingPage(false);
  }, []);


  const filteredMedicines = useMemo(() => {
    return medicines.filter(med =>
      (med.nameKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
       med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       med.categoryKn.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'all' || med.categoryKn === selectedCategory)
    );
  }, [searchTerm, selectedCategory, medicines]);

  const addToCart = (medicine: Medicine) => {
    if (!isAuthenticated) { // This check is largely conceptual now
        toast({ variant: "destructive", title: t("Ntabwo Winjiye", "Ntabwo Winjiye"), description: t("Nyamuneka injira kugirango wongere mu gitebo.", "Nyamuneka injira kugirango wongere mu gitebo.") });
        // router.push('/welcome'); // AppLayout handles this
        return;
    }
    // UI update is ephemeral, backend would handle cart state
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      if (existingItem.quantity < medicine.stock) {
        setCart(prevCart => prevCart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
        toast({ title: t(`${medicine.nameKn} yongewe mu gitebo.`, `${medicine.nameKn} yongewe mu gitebo.`) });
      } else {
        toast({ variant: "destructive", title: t(`Ntushobora kongeraho ${medicine.nameKn}`, `Ntushobora kongeraho ${medicine.nameKn}`), description: t(`Umubare ntarengwa (${medicine.stock}) wagezweho mu gitebo.`, `Umubare ntarengwa (${medicine.stock}) wagezweho mu gitebo.`) });
      }
    } else {
      if (medicine.stock > 0) {
        setCart(prevCart => [...prevCart, { ...medicine, quantity: 1 }]);
        toast({ title: t(`${medicine.nameKn} yongewe mu gitebo.`, `${medicine.nameKn} yongewe mu gitebo.`) });
      } else {
         toast({ variant: "destructive", title: t(`${medicine.nameKn} yashize mu bubiko.`, `${medicine.nameKn} yashize mu bubiko.`) });
      }
    }
  };

  const updateQuantity = (medicineId: string, change: number) => {
    // UI update is ephemeral
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === medicineId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null; 
          if (newQuantity > item.stock) {
            toast({ variant: "destructive", title: t(`Ntushobora kongeraho ${item.nameKn}`, `Ntushobora kongeraho ${item.nameKn}`), description: t(`Umubare ntarengwa (${item.stock}) wagezweho.`, `Umubare ntarengwa (${item.stock}) wagezweho.`) });
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItemClient[]
    );
  };

  const removeFromCart = (medicineId: string) => {
    // UI update is ephemeral
    setCart(prevCart => prevCart.filter(item => item.id !== medicineId));
    toast({ title: t("Ikintu cyakuwe mu gitebo.", "Ikintu cyakuwe mu gitebo.") });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getStatusBadgeClass = (status: OrderClient['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600';
      case 'Pending':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  if (!isClient || isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Gutumiza Imiti", "Gutumiza Imiti")} />
        <div className="flex flex-col justify-center items-center h-auto py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("Gutegura imiti...", "Gutegura imiti...")}</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!isAuthenticated) {
     // This case should be handled by AppLayout redirection primarily.
     return (
         <AppLayout>
            <PageHeader title={t("Gutumiza Imiti", "Gutumiza Imiti")} />
            <Card className="mt-10 text-center p-10">
                <CardTitle>{t("Ugomba Kwinjira", "Ugomba Kwinjira")}</CardTitle>
                <CardDescription className="mt-2">{t("Nyamuneka injira kugirango ubashe gutumiza imiti.", "Nyamuneka injira kugirango ubashe gutumiza imiti.")}</CardDescription>
                <Button onClick={() => router.push('/welcome')} className="mt-6">{t("Injira / Iyandikishe", "Injira / Iyandikishe")}</Button>
            </Card>
         </AppLayout>
     )
  }


  return (
    <AppLayout>
      <PageHeader title={t("Gutumiza Imiti", "Gutumiza Imiti")} breadcrumbs={[{label: t("Imbonerahamwe", "Imbonerahamwe"), href: "/"}, {label: t("Imiti", "Imiti")}]}>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("Shakisha imiti...", "Shakisha imiti...")}
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t("Yungurura ku cyiciro", "Yungurura ku cyiciro")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("Ibyiciro Byose", "Ibyiciro Byose")}</SelectItem>
              {medicineCategoriesKn.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6 font-headline flex items-center">
            <ListFilter className="mr-3 h-6 w-6 text-primary" /> {t("Urutonde rw'Imiti", "Urutonde rw'Imiti")}
          </h2>
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMedicines.map((med) => (
                <Card key={med.id} className="flex flex-col shadow-lg hover-lift group dark:border-border">
                  <CardHeader className="p-0 relative overflow-hidden rounded-t-lg">
                    <Image
                      src={med.imageUrl}
                      alt={med.nameKn}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={med.aiHint}
                    />
                     <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 dark:bg-background/70 backdrop-blur-sm">
                        <Tag className="mr-1 h-3 w-3"/>{med.categoryKn}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-lg mb-1 font-headline group-hover:text-primary transition-colors">{med.nameKn}</CardTitle>
                    <CardDescription className="text-sm mb-2 h-10 overflow-hidden text-ellipsis">{med.descriptionKn}</CardDescription>
                    <p className="text-xl font-semibold text-primary mt-1">{med.price.toLocaleString()} RWF</p>
                    {med.stock > 0 ? (
                       <p className="text-xs text-green-600 dark:text-green-400">{med.stock} {t("mu bubiko", "mu bubiko")}</p>
                    ) : (
                       <p className="text-xs text-destructive dark:text-red-500">{t("Yashize mu bubiko", "Yashize mu bubiko")}</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                    <Button 
                      onClick={() => addToCart(med)} 
                      className="w-full transition-transform hover:scale-105 active:scale-95"
                      disabled={med.stock === 0 || (cart.find(item => item.id === med.id)?.quantity ?? 0) >= med.stock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> 
                      { (cart.find(item => item.id === med.id)?.quantity ?? 0) >= med.stock && med.stock > 0 ? t('Ntarengwa mu Gitebo', 'Ntarengwa mu Gitebo') : med.stock === 0 ? t('Yashize', 'Yashize') : t('Ongeraho mu Gitebo', 'Ongeraho mu Gitebo')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">{t("Nta miti ibonetse ihuye n'ubushakashatsi bwawe.", "Nta miti ibonetse ihuye n'ubushakashatsi bwawe.")}</p>
          )}
        </div>

        <div>
          <Card className="shadow-lg sticky top-24 hover-lift dark:border-border">
            <CardHeader>
              <CardTitle className="flex items-center font-headline text-primary">
                <ShoppingCart className="mr-2 h-6 w-6" /> {t("Igitebo Cyawe", "Igitebo Cyawe")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">{t("Igitebo cyawe kirimo ubusa. Amakuru y'igitebo ntazabikwa.", "Igitebo cyawe kirimo ubusa. Amakuru y'igitebo ntazabikwa.")}</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm bg-background/50 dark:bg-muted/20 hover:shadow-md transition-shadow">
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{item.nameKn}</p>
                        <p className="text-xs text-muted-foreground">{item.price.toLocaleString()} RWF x {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7"><MinusCircle className="h-4 w-4" /></Button>
                        <span className="text-sm w-5 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.stock} className="h-7 w-7"><PlusCircle className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {cart.length > 0 && (
              <CardFooter className="flex flex-col space-y-3 border-t pt-4">
                <div className="flex justify-between w-full text-lg font-semibold">
                  <span>{t("Igiteranyo:", "Igiteranyo:")}</span>
                  <span className="text-primary">{cartTotal.toLocaleString()} RWF</span>
                </div>
                <Button className="w-full transition-transform hover:scale-105 active:scale-95" onClick={() => router.push('/payment')}>{t("Komeza Kwishyura", "Komeza Kwishyura")}</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 font-headline">{t("Ibyo Natumije", "Ibyo Natumije")}</h2>
        {orders.length > 0 ? (
          <Card className="shadow-lg hover-lift dark:border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ID y'Itumiza", "ID y'Itumiza")}</TableHead>
                    <TableHead>{t("Itariki", "Itariki")}</TableHead>
                    <TableHead>{t("Igiteranyo (RWF)", "Igiteranyo (RWF)")}</TableHead>
                    <TableHead>{t("Uko Bihagaze", "Uko Bihagaze")}</TableHead>
                    <TableHead>{t("Ibikubiyemo", "Ibikubiyemo")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/30 dark:hover:bg-muted/20">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={getStatusBadgeClass(order.status)}
                        >
                          {t(order.status, order.status === "Delivered" ? "Byagejejweho" : order.status === "Processing" ? "Birimo Gutunganywa" : order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{order.items.map(item => `${item.nameKn} (x${item.quantity})`).join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground">{t("Nta byo watumije mbere bihari. Amakuru y'ibyo watumije asaba guhuzwa na seriveri.", "Nta byo watumije mbere bihari. Amakuru y'ibyo watumije asaba guhuzwa na seriveri.")}</p>
        )}
      </div>
    </AppLayout>
  );
}
