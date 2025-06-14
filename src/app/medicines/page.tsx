
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, PlusCircle, MinusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  { id: 'med1', name: 'Paracetamol 500mg', description: 'Relieves pain and fever.', price: 5.99, imageUrl: 'https://placehold.co/300x200.png', category: 'Pain Relief', stock: 150, aiHint: 'pills medication' },
  { id: 'med2', name: 'Amoxicillin 250mg', description: 'Antibiotic for bacterial infections.', price: 12.50, imageUrl: 'https://placehold.co/300x200.png', category: 'Antibiotics', stock: 80, aiHint: 'capsules pharmacy' },
  { id: 'med3', name: 'Loratadine 10mg', description: 'Antihistamine for allergies.', price: 8.75, imageUrl: 'https://placehold.co/300x200.png', category: 'Allergy Relief', stock: 120, aiHint: 'tablets allergy' },
  { id: 'med4', name: 'Ibuprofen 200mg', description: 'Anti-inflammatory drug.', price: 7.20, imageUrl: 'https://placehold.co/300x200.png', category: 'Pain Relief', stock: 200, aiHint: 'medicine painkiller' },
  { id: 'med5', name: 'Vitamin C 1000mg', description: 'Immune system support.', price: 10.00, imageUrl: 'https://placehold.co/300x200.png', category: 'Vitamins', stock: 300, aiHint: 'supplements health' },
  { id: 'med6', name: 'Omeprazole 20mg', description: 'Reduces stomach acid.', price: 15.30, imageUrl: 'https://placehold.co/300x200.png', category: 'Digestive Health', stock: 0, aiHint: 'acid reducer' },
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
  { id: 'order1', date: '2024-07-15', items: [{ ...mockMedicines[0], quantity: 2 }, { ...mockMedicines[2], quantity: 1 }], total: 20.73, status: 'Delivered' },
  { id: 'order2', date: '2024-07-28', items: [{ ...mockMedicines[1], quantity: 1 }], total: 12.50, status: 'Processing' },
];

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const filteredMedicines = useMemo(() => {
    return mockMedicines.filter(med =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
          if (newQuantity <= 0) return null; // Will be filtered out
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
        return 'bg-accent text-accent-foreground';
      case 'Processing':
        return 'bg-yellow-500 text-black'; // Kept yellow for processing as it's distinct
      case 'Shipped':
        return 'bg-blue-500 text-white'; // Kept blue for shipped
      case 'Pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Order Medicines" breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "Medicines"}]}>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search medicines or categories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6 font-headline">Medicine Catalog</h2>
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMedicines.map((med) => (
                <Card key={med.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <Image
                      src={med.imageUrl}
                      alt={med.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                      data-ai-hint={med.aiHint}
                    />
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-lg mb-1 font-headline">{med.name}</CardTitle>
                    <Badge variant="outline" className="mb-2">{med.category}</Badge>
                    <CardDescription className="text-sm mb-2">{med.description}</CardDescription>
                    <p className="text-lg font-semibold text-primary">${med.price.toFixed(2)}</p>
                    {med.stock > 0 ? (
                       <p className="text-xs text-green-600 dark:text-green-400">{med.stock} in stock</p>
                    ) : (
                       <p className="text-xs text-red-600 dark:text-red-400">Out of stock</p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button 
                      onClick={() => addToCart(med)} 
                      className="w-full"
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
            <p className="text-muted-foreground">No medicines found matching your search.</p>
          )}
        </div>

        <div>
          <Card className="shadow-lg sticky top-24"> {/* Added sticky positioning */}
            <CardHeader>
              <CardTitle className="flex items-center font-headline">
                <ShoppingCart className="mr-2 h-6 w-6 text-primary" /> Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)}><MinusCircle className="h-4 w-4" /></Button>
                        <span>{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.stock}><PlusCircle className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {cart.length > 0 && (
              <CardFooter className="flex flex-col space-y-3">
                <div className="flex justify-between w-full text-lg font-semibold">
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full">Proceed to Checkout</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 font-headline">My Orders</h2>
        {mockOrders.length > 0 ? (
          <Card className="shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === 'Delivered' ? 'default' : order.status === 'Processing' ? 'secondary' : 'outline'}
                        className={getStatusBadgeClass(order.status)}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <p className="text-muted-foreground">You have no past orders.</p>
        )}
      </div>
    </AppLayout>
  );
}
