
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/logo';
import { User, UserCog, Briefcase, Shield, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


type Role = "patient" | "doctor" | "seeker" | "admin";

const roles: { name: Role; title: string; titleKn: string; description: string; descriptionKn: string; icon: React.ElementType; color: string, bgColor: string, borderColor: string }[] = [
  { name: "patient", title: "Patient", titleKn: "Umurwayi", description: "Access your health records, book appointments, and connect with healthcare providers.", descriptionKn: "Reba dosiye yawe y'ubuzima, fata igihe cyo kwa muganga, kandi uvugane n'abaganga.", icon: User, color: "text-primary", bgColor: "bg-primary/5 hover:bg-primary/10", borderColor: "border-primary/20" },
  { name: "doctor", title: "Doctor", titleKn: "Muganga", description: "Manage your schedule, consult with patients, and access medical tools.", descriptionKn: "Genzura gahunda yawe, vugana n'abarwayi, kandi ukoreshe ibikoresho bya muganga.", icon: Briefcase, color: "text-accent", bgColor: "bg-accent/5 hover:bg-accent/10", borderColor: "border-accent/20" },
  { name: "seeker", title: "Health Seeker", titleKn: "Ushaka Ubujyanama", description: "Explore health resources, find information, and connect with support communities.", descriptionKn: "Shakisha amakuru y'ubuzima, menya byinshi, kandi uhure n'imiryango itanga ubufasha.", icon: UserCog, color: "text-primary", bgColor: "bg-primary/5 hover:bg-primary/10", borderColor: "border-primary/20" },
  { name: "admin", title: "Administrator", titleKn: "Umunyamabanga", description: "Manage platform settings, users, and oversee system operations.", descriptionKn: "Genzura igenamiterere rya porogaramu, abakoresha, kandi ureberere imikorere ya sisitemu.", icon: Shield, color: "text-destructive", bgColor: "bg-destructive/5 hover:bg-destructive/10 dark:text-destructive-foreground dark:bg-destructive/10", borderColor: "border-destructive/20" },
];

export default function WelcomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Defaulting to Kinyarwanda
  const language = 'kn';
  const t = (enText: string, knText: string) => language === 'kn' ? knText : enText;

  useEffect(() => {
    // Any necessary client-side setup after localStorage removal.
    // For instance, if a global state needed reset, it would happen here,
    // but for now, the app defaults to unauthenticated state.
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    // Role selection is transient for UI guidance to next step.
  };

  const getLoginPath = () => {
    if (selectedRole === "admin") return `/admin/login?role=${selectedRole}`;
    return `/login?role=${selectedRole}`;
  };

  const handleRegisterClick = () => {
    if (selectedRole === "admin") {
      toast({
          title: t('Admin Registration', 'Kwiyandikisha kw\'Umunyamabanga'),
          description: t('Administrator accounts are created internally.', 'Konti z\'abanyamabanga zikorerwa imbere.'),
      });
    } else if (selectedRole === "doctor") {
      toast({
          title: t('Doctor Registration', 'Kwiyandikisha kwa Muganga'),
          description: t('Doctor accounts are created by administrators. Please contact support if you are a doctor wishing to join.', 'Konti za muganga zikorerwa n\'abanyamabanga. Nyamuneka vugana n\'ubufasha niba uri muganga wifuza kwinjira.'),
      });
    } else if (selectedRole) {
        router.push(`/register?role=${selectedRole}`);
    }
  };

  const isRegistrationAllowed = selectedRole && selectedRole !== 'admin' && selectedRole !== 'doctor';


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-page p-4 selection:bg-primary selection:text-primary-foreground">
      <Link href="/" className="mb-8 flex items-center space-x-3 text-primary hover:text-primary/80 transition-colors group">
        <LogoIcon className="h-12 w-12 transition-transform duration-500 ease-out group-hover:rotate-[360deg]"/>
        <span className="text-3xl font-bold font-headline">MediServe Hub</span>
      </Link>

      <Card className="w-full max-w-3xl shadow-2xl dark:shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-headline gradient-text">{t('Welcome to MediServe Hub!', 'Murakaza neza kuri MediServe Hub!')}</CardTitle>
          <CardDescription className="text-md sm:text-lg text-muted-foreground">
            {selectedRole ?
              t(`You've selected: ${roles.find(r => r.name === selectedRole)?.title || selectedRole}. Now, please login or register.`, `Wahisemo: ${roles.find(r => r.name === selectedRole)?.titleKn || selectedRole}. Noneho, injira cyangwa wiyandikishe.`)
              : t("Please select your role to continue.", "Nyamuneka hitamo uruhare rwawe kugirango ukomeze.")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!selectedRole ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {roles.map((role) => (
                <Card
                  key={role.name}
                  className={cn("hover-lift cursor-pointer transition-all duration-300 ease-in-out group border-2", role.bgColor, role.borderColor, "hover:shadow-lg dark:hover:shadow-md dark:hover:shadow-primary/30")}
                  onClick={() => handleRoleSelect(role.name)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xl font-medium font-headline ${role.color}`}>{t(role.title, role.titleKn)}</CardTitle>
                    <role.icon className={`h-8 w-8 ${role.color} opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t(role.description, role.descriptionKn)}</p>
                     <div className={`flex items-center pt-3 text-sm font-medium ${role.color} group-hover:underline`}>
                        {t(`I am a ${role.title}`, `Ndi ${role.titleKn}`)} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card
                    className="hover-lift cursor-pointer transition-all duration-300 ease-in-out group bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:shadow-lg dark:hover:shadow-md dark:hover:shadow-primary/30"
                    onClick={() => router.push(getLoginPath())}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-medium font-headline text-primary">{t('Login', 'Injira')}</CardTitle>
                    <LogIn className="h-8 w-8 text-primary opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t('Access your existing account.', 'Injira muri konti yawe isanzwe.')}</p>
                     <div className="flex items-center pt-3 text-sm font-medium text-primary group-hover:underline">
                        {t('Proceed to Login', 'Komeza Winjire')} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                    className={cn(
                        "hover-lift cursor-pointer transition-all duration-300 ease-in-out group bg-accent/10 hover:bg-accent/20 border-2 border-accent/30 hover:shadow-lg dark:hover:shadow-md dark:hover:shadow-accent/30",
                        (selectedRole === 'admin' || selectedRole === 'doctor') && "opacity-60 cursor-not-allowed bg-muted/10 border-muted/30 hover:bg-muted/10"
                    )}
                    onClick={handleRegisterClick}
                >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={cn("text-xl font-medium font-headline text-accent", (selectedRole === 'admin' || selectedRole === 'doctor') && "text-muted-foreground")}>{t('Register', 'Iyandikishe')}</CardTitle>
                    <UserPlus className={cn("h-8 w-8 text-accent opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110", (selectedRole === 'admin' || selectedRole === 'doctor') && "text-muted-foreground")} />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {selectedRole === 'admin' ? t('Admin registration is managed internally.', 'Kwiyandikisha kw\'abanyamabanga bikorerwa imbere.') :
                         selectedRole === 'doctor' ? t('Doctor accounts are created by administrators.', 'Konti za muganga zikorerwa n\'abanyamabanga.') :
                         t('Create a new account.', 'Fungura konti nshya.')
                        }
                    </p>
                    {isRegistrationAllowed && (
                        <div className="flex items-center pt-3 text-sm font-medium text-accent group-hover:underline">
                            {t('Create Account', 'Fungura Konti')} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                    )}
                </CardContent>
                </Card>
              </div>
              <Button variant="outline" onClick={() => setSelectedRole(null)} className="w-full sm:w-auto hover:bg-muted/80 transition-colors">
                {t('Back to Role Selection', 'Subira ku Ihitamo ry\'Uruhare')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
