
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


interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  aiHint: string;
}

const mockMedicines: Medicine[] = [
  { id: 'med1', name: 'Paracetamol 500mg', description: 'Relieves pain and fever.', price: 599, imageUrl: 'https://placehold.co/300x200.png', category: 'Pain Relief', stock: 150, aiHint: 'pills medication' },
  { id: 'med2', name: 'Amoxicillin 250mg', description: 'Antibiotic for bacterial infections.', price: 1250, imageUrl: 'https://placehold.co/300x200.png', category: 'Antibiotics', stock: 80, aiHint: 'capsules pharmacy' },
  { id: 'med3', name: 'Loratadine 10mg', description: 'Antihistamine for allergies.', price: 875, imageUrl: 'https://placehold.co/300x200.png', category: 'Allergy Relief', stock: 120, aiHint: 'tablets allergy' },
  { id: 'med4', name: 'Ibuprofen 200mg', description: 'Anti-inflammatory drug.', price: 720, imageUrl: 'https://placehold.co/300x200.png', category: 'Pain Relief', stock: 200, aiHint: 'medicine painkiller' },
  { id: 'med5', name: 'Vitamin C 1000mg', description: 'Immune system support.', price: 1000, imageUrl: 'https://placehold.co/300x200.png', category: 'Vitamins', stock: 300, aiHint: 'supplements health' },
  { id: 'med6', name: 'Omeprazole 20mg', description: 'Reduces stomach acid.', price: 1530, imageUrl: 'https://placehold.co/300x200.png', category: 'Digestive Health', stock: 0, aiHint: 'acid reducer' },
];

interface CartItem extends Medicine {
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
}

const mockOrders: Order[] = [
  { id: 'order1', date: '2024-07-15', items: [{ ...mockMedicines[0], quantity: 2 }, { ...mockMedicines[2], quantity: 1 }], total: 2073, status: 'Delivered' },
  { id: 'order2', date: '2024-07-28', items: [{ ...mockMedicines[1], quantity: 1 }], total: 1250, status: 'Processing' },
];

const medicineCategories = Array.from(new Set(mockMedicines.map(m => m.category)));

export default function MedicinesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);

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
          description: "Please log in to order medicines.",
        });
        router.replace('/welcome'); 
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [isClient, router, toast]);


  const filteredMedicines = useMemo(() => {
    return mockMedicines.filter(med =>
      (med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'all' || med.category === selectedCategory)
    );
  }, [searchTerm, selectedCategory]);

  const addToCart = (medicine: Medicine) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === medicine.id);
      if (existingItem) {
        if (existingItem.quantity < medicine.stock) {
          toast({ title: `Added ${medicine.name} to cart.`, description: `Quantity updated.` });
          return prevCart.map(item =>
            item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({ variant: "destructive", title: `Cannot add ${medicine.name}`, description: `Maximum stock (${medicine.stock}) reached in cart.` });
          return prevCart;
        }
      } else {
        if (medicine.stock > 0) {
          toast({ title: `Added ${medicine.name} to cart.` });
          return [...prevCart, { ...medicine, quantity: 1 }];
        } else {
           toast({ variant: "destructive", title: `${medicine.name} is out of stock.` });
           return prevCart;
        }
      }
    });
  };

  const updateQuantity = (medicineId: string, change: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === medicineId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null; 
          if (newQuantity > item.stock) {
            toast({ variant: "destructive", title: `Cannot add more ${item.name}`, description: `Maximum stock (${item.stock}) reached.` });
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== medicineId));
    toast({ title: "Item removed from cart." });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getStatusBadgeClass = (status: Order['status']) => {
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

  if (!isClient || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading medicines...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Order Medicines" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Medicines"}]}>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medicines..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {medicineCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6 font-headline flex items-center">
            <ListFilter className="mr-3 h-6 w-6 text-primary" /> Medicine Catalog
          </h2>
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMedicines.map((med) => (
                <Card key={med.id} className="flex flex-col shadow-lg hover-lift group">
                  <CardHeader className="p-0 relative">
                    <Image
                      src={med.imageUrl}
                      alt={med.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={med.aiHint}
                    />
                     <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
                        <Tag className="mr-1 h-3 w-3"/>{med.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-lg mb-1 font-headline group-hover:text-primary transition-colors">{med.name}</CardTitle>
                    <CardDescription className="text-sm mb-2 h-10 overflow-hidden text-ellipsis">{med.description}</CardDescription>
                    <p className="text-xl font-semibold text-primary mt-1">{med.price.toLocaleString()} RWF</p>
                    {med.stock > 0 ? (
                       <p className="text-xs text-green-600 dark:text-green-400">{med.stock} in stock</p>
                    ) : (
                       <p className="text-xs text-destructive dark:text-red-500">Out of stock</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                    <Button 
                      onClick={() => addToCart(med)} 
                      className="w-full transition-transform hover:scale-105 active:scale-95"
                      disabled={med.stock === 0 || (cart.find(item => item.id === med.id)?.quantity ?? 0) >= med.stock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> 
                      { (cart.find(item => item.id === med.id)?.quantity ?? 0) >= med.stock && med.stock > 0 ? 'Max in Cart' : med.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">No medicines found matching your search or filter.</p>
          )}
        </div>

        <div>
          <Card className="shadow-lg sticky top-24 hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center font-headline text-primary">
                <ShoppingCart className="mr-2 h-6 w-6" /> Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm bg-background/50 hover:shadow-md transition-shadow">
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{item.name}</p>
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
                  <span>Total:</span>
                  <span className="text-primary">{cartTotal.toLocaleString()} RWF</span>
                </div>
                <Button className="w-full transition-transform hover:scale-105 active:scale-95" onClick={() => router.push('/payment')}>Proceed to Checkout</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 font-headline">My Orders</h2>
        {mockOrders.length > 0 ? (
          <Card className="shadow-lg hover-lift">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total (RWF)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={getStatusBadgeClass(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground">You have no past orders.</p>
        )}
      </div>
    </AppLayout>
  );
}
