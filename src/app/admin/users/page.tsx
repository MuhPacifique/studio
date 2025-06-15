
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Edit3, Trash2, Search, Save, Camera, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  AlertDialogContent as AlertDialogContentComponent, 
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';


const t = (enText: string, knText: string) => knText; 

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Admin' | 'Doctor' | 'Seeker';
  status: 'Active' | 'Inactive';
  joinedDate: string;
  profileImageUrl?: string; 
}

// Initial mock data, will not persist after page reload.
const initialMockUsers: User[] = [
  { id: 'usr1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Patient', status: 'Active', joinedDate: '2023-01-15', profileImageUrl: 'https://placehold.co/60x60.png?text=AW' },
  { id: 'usr2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Patient', status: 'Inactive', joinedDate: '2023-02-20', profileImageUrl: 'https://placehold.co/60x60.png?text=BB' },
  { id: 'usr3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Seeker', status: 'Active', joinedDate: '2023-03-10', profileImageUrl: 'https://placehold.co/60x60.png?text=CB' },
  { id: 'usr4', name: 'Dr. Diana Prince', email: 'diana.admin@mediserve.com', role: 'Admin', status: 'Active', joinedDate: '2022-12-01', profileImageUrl: 'https://placehold.co/60x60.png?text=DP' },
  { id: 'usr5', name: 'Dr. Alex Smith', email: 'doctor@example.com', role: 'Doctor', status: 'Active', joinedDate: '2023-05-01', profileImageUrl: 'https://placehold.co/60x60.png?text=AS' },
];

const userFormSchema = z.object({
  name: z.string().min(2, { message: t("Izina rigomba kuba nibura inyuguti 2.", "Izina rigomba kuba nibura inyuguti 2.") }),
  email: z.string().email({ message: t("Aderesi email yanditse nabi.", "Aderesi email yanditse nabi.") }),
  role: z.enum(['Patient', 'Admin', 'Doctor', 'Seeker'], { required_error: t("Uruhare rurasabwa.", "Uruhare rurasabwa.") }),
  status: z.enum(['Active', 'Inactive'], { required_error: t("Uko umukoresha ahagaze birasabwa.", "Uko umukoresha ahagaze birasabwa.") }),
  profileImageUrl: z.string().url({message: t("URL y'ishusho y'umwirondoro yanditse nabi.", "URL y'ishusho y'umwirondoro yanditse nabi.")}).optional().or(z.literal("")),
});

type UserFormValues = z.infer<ReturnType<typeof userFormSchema>>;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const router = useRouter(); // Kept for potential future use, not critical for this refactor
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  // Assume if user reaches this page, they are an "authenticated admin" for prototype purposes.
  // Real auth check is handled by AppLayout.
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(true); 

  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false); 
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Simulate fetching initial data. No localStorage means data resets on reload.
    setUsersList(initialMockUsers);
    setIsLoadingPage(false);
  }, []);


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
      if (file.size > 1 * 1024 * 1024) { 
        toast({ variant: "destructive", title: t("Ifoto ni Nini Cyane", "Ifoto ni Nini Cyane"), description: t("Nyamuneka hitamo ifoto iri munsi ya 1MB.", "Nyamuneka hitamo ifoto iri munsi ya 1MB.")});
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

  const handleOpenFormDialog = (user: User | null = null) => {
    setEditingUser(user);
    setIsFormDialogOpen(true);
  };

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: UserFormValues) => {
    const profileImageToSave = imagePreview || data.profileImageUrl || `https://placehold.co/60x60.png?text=${getInitials(data.name)}`;
    
    // UI update is ephemeral, backend would handle persistence
    if (editingUser) {
      setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...data, profileImageUrl: profileImageToSave } : u));
      toast({ title: t("Umukoresha Yahinduwe (Igerageza)", "Umukoresha Yahinduwe (Igerageza)"), description: t(`${data.name} yahinduwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`, `${data.name} yahinduwe. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`) });
    } else {
      const newUser: User = {
        ...data,
        id: `usr${Date.now()}`, // Client-side ID for list key, backend would generate real ID
        joinedDate: new Date().toISOString().split('T')[0],
        profileImageUrl: profileImageToSave,
      };
      setUsersList(prev => [newUser, ...prev]);
      toast({ title: t("Umukoresha Yongeweho (Igerageza)", "Umukoresha Yongeweho (Igerageza)"), description: t(`${data.name} yongeweho. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`, `${data.name} yongeweho. Ibi byoherejwe kuri seriveri (mu buryo bw'ikitegererezo).`) });
    }
    setIsFormDialogOpen(false);
    setEditingUser(null);
    form.reset(); 
    setImagePreview(null);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    // UI update is ephemeral
    setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
    toast({ title: t("Umukoresha Yasibwe (Igerageza)", "Umukoresha Yasibwe (Igerageza)"), description: t(`${userToDelete.name} yasibwe. Gusiba nyako bisaba seriveri.`, `${userToDelete.name} yasibwe. Gusiba nyako bisaba seriveri.`), variant: 'destructive' });
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
    if (role === 'Patient') return t('Patient', 'Umurwayi');
    if (role === 'Admin') return t('Admin', 'Umunyamabanga');
    if (role === 'Doctor') return t('Doctor', 'Muganga');
    if (role === 'Seeker') return t('Seeker', 'Ushaka Ubujyanama');
    return role;
  }

  const translateStatus = (status: User['status']) => {
    if (status === 'Active') return t('Active', 'Arakora');
    if (status === 'Inactive') return t('Inactive', 'Ntarakora');
    return status;
  }

  if (isLoadingPage) {
    return (
      <AppLayout>
        <PageHeader title={t("Manage Users", "Gucunga Abakoresha")} />
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t("Loading users...", "Gutegura abakoresha...")}</p>
        </div>
      </AppLayout>
    );
  }

  // This check is conceptual. AppLayout handles actual redirection.
  if (!isAuthenticatedAdmin) {
    toast({ variant: "destructive", title: t("Access Denied", "Ntabwo Wemerewe") });
    // router.replace('/admin/login'); // This might cause infinite loop if AppLayout logic isn't perfect
    return <AppLayout><PageHeader title={t("Access Denied", "Ntabwo Wemerewe")} /></AppLayout>;
  }

  return (
    <AppLayout>
      <PageHeader
        title={t("Manage Users", "Gucunga Abakoresha")}
        breadcrumbs={[
            { label: t("Dashboard", "Imbonerahamwe"), href: "/" }, 
            { label: t("Admin", "Ubuyobozi"), href: "/admin/dashboard" }, 
            { label: t("Users", "Abakoresha") }
        ]}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t("Search users...", "Shakisha abakoresha...")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenFormDialog(null)} className="transition-transform hover:scale-105 active:scale-95">
            <UserPlus className="mr-2 h-4 w-4" /> {t("Add New User", "Ongeraho Umukoresha Mushya")}
          </Button>
        </div>
      </PageHeader>
      <Card className="shadow-xl hover-lift">
        <CardHeader>
          <CardTitle className="font-headline">{t("User List", "Urutonde rw'Abakoresha")}</CardTitle>
          <CardDescription>{t("View, edit, or remove user accounts. Changes are illustrative and require backend integration.", "Reba, hindura, cyangwa ukureho konti. Impinduka ni iz'ikitegererezo kandi zisaba guhuzwa na seriveri.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Avatar", "Ifoto")}</TableHead>
                <TableHead>{t("Name", "Izina")}</TableHead>
                <TableHead>{t("Email", "Email")}</TableHead>
                <TableHead>{t("Role", "Uruhare")}</TableHead>
                <TableHead>{t("Status", "Uko Ahagaze")}</TableHead>
                <TableHead>{t("Joined Date", "Itariki Yinjiyeho")}</TableHead>
                <TableHead>{t("Actions", "Ibikorwa")}</TableHead>
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
                    <Button variant="outline" size="icon" aria-label={t("Edit user", "Hindura umukoresha")} onClick={() => handleOpenFormDialog(user)} className="hover:border-primary hover:text-primary transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label={t("Delete user", "Siba umukoresha")} onClick={() => handleDeleteUserClick(user)} className="hover:opacity-80 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t("No users found matching your search.", "Nta bakoresha bahuye n'ubushakashatsi bwawe babonetse.")}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <DialogHeader>
                <DialogTitle>{editingUser ? t('Edit User', 'Hindura Umukoresha') : t('Add New User', 'Ongeraho Umukoresha Mushya')}</DialogTitle>
                <DialogDescription>
                {editingUser ? t("Update the user's details. (Mock - backend needed)", "Hindura amakuru y'umukoresha. (Igerageza - seriveri irakenewe)") : t("Fill in the details to create a new user. (Mock - backend needed)", "Uzuza amakuru kugirango ukore umukoresha mushya. (Igerageza - seriveri irakenewe)")}
                </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-md">
                    <AvatarImage src={imagePreview || form.watch("profileImageUrl") || undefined} alt={t("Profile Preview", "Ifoto y'Agateganyo")} data-ai-hint="user placeholder"/>
                    <AvatarFallback className="text-3xl">{form.watch("name") ? getInitials(form.watch("name")) : "U"}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4"/> {t("Change Photo", "Hindura Ifoto")}
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
                        <Label htmlFor="profileImageUrl-input-admin-dialog" className="text-xs text-muted-foreground">{t("Profile Image URL (or leave blank for auto-selection)", "URL y'Ifoto y'Umwirondoro (cyangwa usige ubusa ngo yihitemo)")}</Label>
                        <Input id="profileImageUrl-input-admin-dialog" {...field} placeholder="https://example.com/image.png" className="mt-1 text-xs" />
                        {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                        </div>
                    )}
                />
            </div>

            <div>
              <Label htmlFor="name">{t("Full Name", "Amazina Yuzuye")}</Label>
              <Input id="name" {...form.register("name")} className="mt-1" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">{t("Email", "Email")}</Label>
              <Input id="email" type="email" {...form.register("email")} className="mt-1" />
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="role">{t("Role", "Uruhare")}</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder={t("Select a role", "Hitamo uruhare")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Patient">{t("Patient", "Umurwayi")}</SelectItem>
                      <SelectItem value="Doctor">{t("Doctor", "Muganga")}</SelectItem>
                      <SelectItem value="Seeker">{t("Seeker", "Ushaka Ubujyanama")}</SelectItem>
                      <SelectItem value="Admin">{t("Admin", "Umunyamabanga")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>}
            </div>
            <div>
              <Label htmlFor="status">{t("Status", "Uko Ahagaze")}</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder={t("Select status", "Hitamo uko ahagaze")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">{t("Active", "Arakora")}</SelectItem>
                      <SelectItem value="Inactive">{t("Inactive", "Ntarakora")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
               {form.formState.errors.status && <p className="text-sm text-destructive mt-1">{form.formState.errors.status.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsFormDialogOpen(false); setEditingUser(null); form.reset(); setImagePreview(null);}}>{t("Cancel", "Hagarika")}</Button>
              <Button type="submit" className="transition-transform hover:scale-105 active:scale-95"><Save className="mr-2 h-4 w-4" /> {editingUser ? t('Save Changes', 'Bika Impinduka') : t('Add User', 'Ongeraho Umukoresha')}</Button>
            </DialogFooter>
          </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContentComponent> 
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Confirm Deletion", "Emeza Gusiba")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to delete this user: ", "Urifuza gusiba uyu mukoresha: ")}
              <span className="font-semibold">{userToDelete?.name}</span>? {t("This action cannot be undone. (Mock - backend needed)", "Iki gikorwa ntigishobora gusubizwamo. (Igerageza - seriveri irakenewe)")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>{t("Cancel", "Hagarika")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-transform hover:scale-105 active:scale-95">{t("Delete User", "Siba Umukoresha")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContentComponent>
      </AlertDialog>

    </AppLayout>
  );
}
```