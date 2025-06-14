
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Edit3, Trash2, Search, Save, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Admin' | 'Doctor' | 'Seeker';
  status: 'Active' | 'Inactive';
  joinedDate: string;
  profileImageUrl?: string; 
}

const initialMockUsers: User[] = [
  { id: 'usr1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Patient', status: 'Active', joinedDate: '2023-01-15', profileImageUrl: 'https://placehold.co/60x60.png?text=AW' },
  { id: 'usr2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Patient', status: 'Inactive', joinedDate: '2023-02-20', profileImageUrl: 'https://placehold.co/60x60.png?text=BB' },
  { id: 'usr3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Seeker', status: 'Active', joinedDate: '2023-03-10', profileImageUrl: 'https://placehold.co/60x60.png?text=CB' },
  { id: 'usr4', name: 'Dr. Diana Prince', email: 'diana.admin@mediserve.com', role: 'Admin', status: 'Active', joinedDate: '2022-12-01', profileImageUrl: 'https://placehold.co/60x60.png?text=DP' },
  { id: 'usr5', name: 'Dr. Alex Smith', email: 'doctor@example.com', role: 'Doctor', status: 'Active', joinedDate: '2023-05-01', profileImageUrl: 'https://placehold.co/60x60.png?text=AS' },
];

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(['Patient', 'Admin', 'Doctor', 'Seeker'], { required_error: "Role is required." }),
  status: z.enum(['Active', 'Inactive'], { required_error: "Status is required." }),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState<User[]>(initialMockUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: '', email: '', role: 'Patient', status: 'Active', profileImageUrl: '' },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset(editingUser);
      setImagePreview(editingUser.profileImageUrl || null);
    } else {
      form.reset({ name: '', email: '', role: 'Patient', status: 'Active', profileImageUrl: '' });
      setImagePreview(null);
    }
  }, [editingUser, form]);

  const filteredUsers = usersList.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("profileImageUrl", reader.result as string); // For mock
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUserClick = () => {
    setEditingUser(null);
    form.reset({ name: '', email: '', role: 'Patient', status: 'Active', profileImageUrl: '' });
    setImagePreview(null);
    setIsAddDialogOpen(true);
  };

  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUserClick = (userId: string) => {
    setDeletingUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddUserSubmit = (data: UserFormValues) => {
    const newUser: User = {
      ...data,
      id: `usr${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      profileImageUrl: imagePreview || data.profileImageUrl, // Use preview if available
    };
    setUsersList(prev => [newUser, ...prev]);
    toast({ title: "User Added", description: `${data.name} has been added.` });
    setIsAddDialogOpen(false);
  };

  const handleEditUserSubmit = (data: UserFormValues) => {
    if (!editingUser) return;
    setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...data, profileImageUrl: imagePreview || data.profileImageUrl } : u));
    toast({ title: "User Updated", description: `${data.name}'s information has been updated.` });
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const confirmDeleteUser = () => {
    if (!deletingUserId) return;
    const userToDelete = usersList.find(u => u.id === deletingUserId);
    setUsersList(prev => prev.filter(u => u.id !== deletingUserId));
    toast({ title: "User Deleted", description: `${userToDelete?.name || 'User'} has been deleted.`, variant: 'destructive' });
    setIsDeleteDialogOpen(false);
    setDeletingUserId(null);
  };
  
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0]?.[0] || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
    return (firstInitial + lastInitial).toUpperCase() || "U";
  };


  return (
    <AppLayout>
      <PageHeader
        title="Manage Users"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Admin", href: "/admin/dashboard" }, { label: "Users" }]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddUserClick}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">User List</CardTitle>
          <CardDescription>View, edit, or remove user accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImageUrl || `https://placehold.co/60x60.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="user avatar professional"/>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={user.status === 'Active' ? 'bg-accent text-accent-foreground' : 'bg-muted-foreground text-background'}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label="Edit user" onClick={() => handleEditUserClick(user)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label="Delete user" onClick={() => handleDeleteUserClick(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found matching your search.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's details." : "Fill in the details to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(editingUser ? handleEditUserSubmit : handleAddUserSubmit)} className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview || form.watch("profileImageUrl") || `https://placehold.co/96x96.png?text=${form.watch("name") ? getInitials(form.watch("name")) : 'U' }`} alt="Profile Preview"/>
                    <AvatarFallback>{form.watch("name") ? getInitials(form.watch("name")) : "U"}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4"/> Change Photo (Mock)
                </Button>
                <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif" 
                    onChange={handleImageChange}
                />
                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem className="w-full hidden"> {/* Hidden, managed by preview logic */}
                      <FormControl>
                        <Input {...field} placeholder="Image URL (mock)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register("name")} className="mt-1" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} className="mt-1" />
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Patient">Patient</SelectItem>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Seeker">Seeker</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
               {form.formState.errors.status && <p className="text-sm text-destructive mt-1">{form.formState.errors.status.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => editingUser ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit"><Save className="mr-2 h-4 w-4" /> {editingUser ? 'Save Changes' : 'Add User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}

    