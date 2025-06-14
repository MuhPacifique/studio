
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Edit3, Trash2, Search, Save, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// Translation helper
const t = (enText: string, knText: string, lang: 'en' | 'kn') => lang === 'kn' ? knText : enText;

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

const userFormSchema = (lang: 'en' | 'kn') => z.object({
  name: z.string().min(2, { message: t("Name must be at least 2 characters.", "Izina rigomba kuba nibura inyuguti 2.", lang) }),
  email: z.string().email({ message: t("Invalid email address.", "Aderesi email yanditse nabi.", lang) }),
  role: z.enum(['Patient', 'Admin', 'Doctor', 'Seeker'], { required_error: t("Role is required.", "Uruhare rurasabwa.", lang) }),
  status: z.enum(['Active', 'Inactive'], { required_error: t("Status is required.", "Uko umukoresha ahagaze birasabwa.", lang) }),
  profileImageUrl: z.string().url({message: t("Invalid URL for profile image.", "URL y'ishusho y'umwirondoro yanditse nabi.", lang)}).optional().or(z.literal("")),
});

type UserFormValues = z.infer<ReturnType<typeof userFormSchema>>;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState<User[]>(initialMockUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) setCurrentLanguage(lang);
  }, []);

  const currentT = (enText: string, knText: string) => t(enText, knText, currentLanguage);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema(currentLanguage)),
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
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({ variant: "destructive", title: currentT("Image Too Large", "Ifoto ni Nini Cyane"), description: currentT("Please select an image smaller than 1MB.", "Nyamuneka hitamo ifoto iri munsi ya 1MB.")});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("profileImageUrl", result, { shouldValidate: true, shouldDirty: true });
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
    setImagePreview(user.profileImageUrl || null);
    form.reset(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleAddUserSubmit = (data: UserFormValues) => {
    const newUser: User = {
      ...data,
      id: `usr${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
      profileImageUrl: imagePreview || data.profileImageUrl || `https://placehold.co/60x60.png?text=${getInitials(data.name)}`,
    };
    setUsersList(prev => [newUser, ...prev]);
    toast({ title: currentT("User Added", "Umukoresha Yongeweho"), description: currentT(`${data.name} has been added.`, `${data.name} yongeweho.`) });
    setIsAddDialogOpen(false);
  };

  const handleEditUserSubmit = (data: UserFormValues) => {
    if (!editingUser) return;
    setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...data, profileImageUrl: imagePreview || data.profileImageUrl || `https://placehold.co/60x60.png?text=${getInitials(data.name)}` } : u));
    toast({ title: currentT("User Updated", "Umukoresha Yahinduwe"), description: currentT(`${data.name}'s information has been updated.`, `Amakuru ya ${data.name} yahinduwe.`) });
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
    toast({ title: currentT("User Deleted", "Umukoresha Yasibwe"), description: currentT(`${userToDelete.name} has been deleted.`, `${userToDelete.name} yasibwe.`), variant: 'destructive' });
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0]?.[0] || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
    return (firstInitial + lastInitial).toUpperCase() || "U";
  };

  const translateRole = (role: User['role']) => {
    if (currentLanguage === 'kn') {
        if (role === 'Patient') return 'Umurwayi';
        if (role === 'Admin') return 'Umunyamabanga';
        if (role === 'Doctor') return 'Muganga';
        if (role === 'Seeker') return 'Ushaka Ubujyanama';
    }
    return role;
  }

  const translateStatus = (status: User['status']) => {
    if (currentLanguage === 'kn') {
        if (status === 'Active') return 'Arakora';
        if (status === 'Inactive') return 'Ntarakora';
    }
    return status;
  }


  return (
    <AppLayout>
      <PageHeader
        title={currentT("Manage Users", "Gucunga Abakoresha")}
        breadcrumbs={[
            { label: currentT("Dashboard", "Imbonerahamwe"), href: "/" }, 
            { label: currentT("Admin", "Ubuyobozi"), href: "/admin/dashboard" }, 
            { label: currentT("Users", "Abakoresha") }
        ]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={currentT("Search users...", "Shakisha abakoresha...")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddUserClick} className="transition-transform hover:scale-105 active:scale-95">
            <UserPlus className="mr-2 h-4 w-4" /> {currentT("Add New User", "Ongeraho Umukoresha Mushya")}
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline">{currentT("User List", "Urutonde rw'Abakoresha")}</CardTitle>
          <CardDescription>{currentT("View, edit, or remove user accounts. Profile images are mock.", "Reba, hindura, cyangwa ukureho konti z'abakoresha. Amafoto y'umwirondoro ni ay'ikitegererezo.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{currentT("Avatar", "Ifoto")}</TableHead>
                <TableHead>{currentT("Name", "Izina")}</TableHead>
                <TableHead>{currentT("Email", "Email")}</TableHead>
                <TableHead>{currentT("Role", "Uruhare")}</TableHead>
                <TableHead>{currentT("Status", "Uko Ahagaze")}</TableHead>
                <TableHead>{currentT("Joined Date", "Itariki Yinjiyeho")}</TableHead>
                <TableHead>{currentT("Actions", "Ibikorwa")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell>
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.name} data-ai-hint="user avatar professional"/>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'destructive' : (user.role === 'Doctor' ? 'secondary' : 'default')} className={user.role === 'Admin' ? "" : (user.role === 'Doctor' ? "" : "bg-primary/80 text-primary-foreground")}>{translateRole(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={user.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:bg-green-700/30 dark:text-green-300 border border-green-500/50' : 'bg-muted-foreground/20 text-muted-foreground border border-muted-foreground/50'}
                    >
                      {translateStatus(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" aria-label={currentT("Edit user", "Hindura umukoresha")} onClick={() => handleEditUserClick(user)} className="hover:border-primary hover:text-primary transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label={currentT("Delete user", "Siba umukoresha")} onClick={() => handleDeleteUserClick(user)} className="hover:opacity-80 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{currentT("No users found matching your search.", "Nta bakoresha bahuye n'ubushakashatsi bwawe babonetse.")}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(editingUser ? handleEditUserSubmit : handleAddUserSubmit)} className="space-y-4 py-4">
            <DialogHeader>
                <DialogTitle>{editingUser ? currentT('Edit User', 'Hindura Umukoresha') : currentT('Add New User', 'Ongeraho Umukoresha Mushya')}</DialogTitle>
                <DialogDescription>
                {editingUser ? currentT("Update the user's details.", "Hindura amakuru y'umukoresha.") : currentT("Fill in the details to create a new user.", "Uzuza amakuru kugirango ukore umukoresha mushya.")}
                </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-md">
                    <AvatarImage src={imagePreview || form.watch("profileImageUrl") || undefined} alt={currentT("Profile Preview", "Ifoto y'Agateganyo")} data-ai-hint="user placeholder"/>
                    <AvatarFallback className="text-3xl">{form.watch("name") ? getInitials(form.watch("name")) : "U"}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4"/> {currentT("Change Photo", "Hindura Ifoto")}
                </Button>
                <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif" 
                    onChange={handleImageChange}
                />
                <Controller
                    name="profileImageUrl"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div className="w-full">
                        <Label htmlFor="profileImageUrl-input-admin-dialog" className="text-xs text-muted-foreground">{currentT("Profile Image URL (or leave blank for auto-selection)", "URL y'Ifoto y'Umwirondoro (cyangwa usige ubusa ngo yihitemo)")}</Label>
                        <Input id="profileImageUrl-input-admin-dialog" {...field} placeholder="https://example.com/image.png" className="mt-1 text-xs" />
                        {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                        </div>
                    )}
                />
            </div>

            <div>
              <Label htmlFor="name">{currentT("Full Name", "Amazina Yuzuye")}</Label>
              <Input id="name" {...form.register("name")} className="mt-1" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">{currentT("Email", "Email")}</Label>
              <Input id="email" type="email" {...form.register("email")} className="mt-1" />
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="role">{currentT("Role", "Uruhare")}</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder={currentT("Select a role", "Hitamo uruhare")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Patient">{currentT("Patient", "Umurwayi")}</SelectItem>
                      <SelectItem value="Doctor">{currentT("Doctor", "Muganga")}</SelectItem>
                      <SelectItem value="Seeker">{currentT("Seeker", "Ushaka Ubujyanama")}</SelectItem>
                      <SelectItem value="Admin">{currentT("Admin", "Umunyamabanga")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>}
            </div>
            <div>
              <Label htmlFor="status">{currentT("Status", "Uko Ahagaze")}</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder={currentT("Select status", "Hitamo uko ahagaze")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">{currentT("Active", "Arakora")}</SelectItem>
                      <SelectItem value="Inactive">{currentT("Inactive", "Ntarakora")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
               {form.formState.errors.status && <p className="text-sm text-destructive mt-1">{form.formState.errors.status.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => editingUser ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)}>{currentT("Cancel", "Hagarika")}</Button>
              <Button type="submit" className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" /> {editingUser ? currentT('Save Changes', 'Bika Impinduka') : currentT('Add User', 'Ongeraho Umukoresha')}</Button>
            </DialogFooter>
          </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{currentT("Confirm Deletion", "Emeza Gusiba")}</AlertDialogTitle>
            <AlertDialogDescription>
              {currentT("Are you sure you want to delete this user: ", "Urifuza gusiba uyu mukoresha: ")}
              <span className="font-semibold">{userToDelete?.name}</span>? {currentT("This action cannot be undone.", "Iki gikorwa ntigishobora gusubizwamo.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>{currentT("Cancel", "Hagarika")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-transform hover:scale-105 active:scale-95">{currentT("Delete User", "Siba Umukoresha")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppLayout>
  );
}
