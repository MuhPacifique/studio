
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Edit3, Trash2, Search, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Admin';
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

const initialMockUsers: User[] = [
  { id: 'usr1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Patient', status: 'Active', joinedDate: '2023-01-15' },
  { id: 'usr2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Patient', status: 'Inactive', joinedDate: '2023-02-20' },
  { id: 'usr3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Patient', status: 'Active', joinedDate: '2023-03-10' },
  { id: 'usr4', name: 'Dr. Diana Prince', email: 'diana.admin@mediserve.com', role: 'Admin', status: 'Active', joinedDate: '2022-12-01' },
];

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(['Patient', 'Admin'], { required_error: "Role is required." }),
  status: z.enum(['Active', 'Inactive'], { required_error: "Status is required." }),
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

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: '', email: '', role: 'Patient', status: 'Active' },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset(editingUser);
    } else {
      form.reset({ name: '', email: '', role: 'Patient', status: 'Active' });
    }
  }, [editingUser, form]);

  const filteredUsers = usersList.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUserClick = () => {
    setEditingUser(null);
    form.reset({ name: '', email: '', role: 'Patient', status: 'Active' });
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
    };
    setUsersList(prev => [newUser, ...prev]);
    toast({ title: "User Added", description: `${data.name} has been added.` });
    setIsAddDialogOpen(false);
  };

  const handleEditUserSubmit = (data: UserFormValues) => {
    if (!editingUser) return;
    setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...data } : u));
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

      {/* Add/Edit User Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's details." : "Fill in the details to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(editingUser ? handleEditUserSubmit : handleAddUserSubmit)} className="space-y-4 py-4">
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

      {/* Delete Confirmation Dialog */}
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
