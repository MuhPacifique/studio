
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Pill,
  Stethoscope,
  MessageSquareQuote,
  FlaskConical,
  Video,
  CreditCard,
  LayoutDashboard,
  ActivitySquare,
  ClipboardList as ClipboardListIcon, 
  Users,
  Settings,
  BookOpen, 
  HeartPulse, 
  LifeBuoy, 
  ChevronDown,
  ChevronRight,
  MessageCircleQuestion, 
  Users2,
  CalendarPlus, 
  CalendarCheck2,
  FileHeart 
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

interface NavItem {
  href: string;
  label: string;
  labelKn: string; 
  icon: React.ElementType;
  adminOnly?: boolean;
  doctorOnly?: boolean;
  patientOnly?: boolean; 
  subItems?: NavItem[];
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', labelKn: 'Imbonerahamwe', icon: Home, requiresAuth: true },
  { href: '/medicines', label: 'Order Medicines', labelKn: 'Gura Imiti', icon: Pill, requiresAuth: true, patientOnly: true },
  { href: '/medical-tests', label: 'Medical Tests', labelKn: 'Ibipimo bya Muganga', icon: ClipboardListIcon, requiresAuth: true, patientOnly: true },
  { 
    href: '#appointments', 
    label: 'Appointments', 
    labelKn: 'Amateraniro',
    icon: CalendarCheck2, 
    requiresAuth: true,
    patientOnly: true,
    subItems: [
      { href: '/appointments/book', label: 'Book Appointment', labelKn: 'Fata Igihe', icon: CalendarPlus, requiresAuth: true, patientOnly: true },
      { href: '/appointments/my-appointments', label: 'My Appointments', labelKn: 'Amateraniro Yanjye', icon: CalendarCheck2, requiresAuth: true, patientOnly: true },
    ]
  },
  { 
    href: '#my-health', 
    label: 'My Health', 
    labelKn: 'Ubuzima Bwanjye',
    icon: FileHeart, 
    requiresAuth: true,
    patientOnly: true, 
    subItems: [
      { href: '/my-health/prescriptions', label: 'My Prescriptions', labelKn: 'Imiti Nandikiwe', icon: ClipboardListIcon, requiresAuth: true, patientOnly: true },
    ]
  },
  { 
    href: '#health-resources', 
    label: 'Health Resources', 
    labelKn: 'Amakuru y\'Ubuzima',
    icon: LifeBuoy, 
    requiresAuth: true,
    subItems: [
      { href: '/health-resources/articles', label: 'Educational Articles', labelKn: 'Inyandiko Zigisha', icon: BookOpen, requiresAuth: true },
      { href: '/health-resources/wellness-tips', label: 'Wellness Tips', labelKn: 'Inama z\'Ubuzima', icon: HeartPulse, requiresAuth: true },
    ]
  },
  { 
    href: '#community-support', 
    label: 'Community & Support', 
    labelKn: 'Ubufatanye & Ubufasha',
    icon: Users2, 
    requiresAuth: true,
    subItems: [
      { href: '/community-support/forums', label: 'Patient Forums', labelKn: 'Ibiganiro by\'Abarwayi', icon: MessageCircleQuestion, requiresAuth: true },
      { href: '/community-support/support-groups', label: 'Support Groups', labelKn: 'Amatsinda y\'Ubufasha', icon: Users2, requiresAuth: true },
    ]
  },
  { href: '/symptom-analyzer', label: 'Symptom Analyzer', labelKn: 'Isesengura ry\'Ibimenyetso', icon: ActivitySquare, requiresAuth: true },
  { href: '/faq', label: 'Medical FAQ', labelKn: 'Ibibazo Bikunze Kubazwa', icon: MessageSquareQuote, requiresAuth: true },
  { href: '/test-yourself', label: 'Test Yourself', labelKn: 'Isúzumé Ubwawe', icon: FlaskConical, requiresAuth: true },
  { href: '/online-consultation', label: 'Online Consultation', labelKn: 'Ubujyanama kuri Interineti', icon: Video, requiresAuth: true },
  { href: '/payment', label: 'Make Payment', labelKn: 'Kwishyura', icon: CreditCard, requiresAuth: true, patientOnly: true },
  { 
    href: '/doctor/dashboard', 
    label: 'Doctor Portal', 
    labelKn: 'Irembo rya Muganga',
    icon: Stethoscope, 
    doctorOnly: true, 
    requiresAuth: true, 
    subItems: [
        { href: '/doctor/dashboard', label: 'Doctor Overview', labelKn: 'Incámáke ya Muganga', icon: LayoutDashboard, doctorOnly: true, requiresAuth: true },
        { href: '/doctor/prescribe', label: 'Prescribe / Advise', labelKn: 'Kwandika Imiti / Inama', icon: ClipboardListIcon, doctorOnly: true, requiresAuth: true },
    ]
  },
  { 
    href: '#admin-section', 
    label: 'Admin Section', 
    labelKn: 'Igice cy\'Ubuyobozi',
    icon: LayoutDashboard, 
    adminOnly: true,
    requiresAuth: true,
    subItems: [
      { href: '/admin/dashboard', label: 'Overview', labelKn: 'Incámáke', icon: LayoutDashboard, adminOnly: true, requiresAuth: true },
      { href: '/admin/users', label: 'Manage Users', labelKn: 'Gucunga Abakoresha', icon: Users, adminOnly: true, requiresAuth: true },
      { href: '/admin/inventory', label: 'Manage Inventory', labelKn: 'Gucunga Ububiko', icon: Pill, adminOnly: true, requiresAuth: true },
      { href: '/admin/services', label: 'Manage Services', labelKn: 'Gucunga Serivisi', icon: Settings, adminOnly: true, requiresAuth: true },
      { href: '/admin/analytics', label: 'Analytics', labelKn: 'Isesengura', icon: Stethoscope, adminOnly: true, requiresAuth: true },
      { href: '/admin/settings', label: 'System Settings', labelKn: 'Igenamiterere rya Sisitemu', icon: Settings, adminOnly: true, requiresAuth: true },
    ]
  },
];

type UserRole = 'patient' | 'admin' | 'doctor' | 'seeker' | null;

const useAuth = () => {
  const [userType, setUserType] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'kn'>('kn');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const mockAuth = localStorage.getItem('mockAuth');
      const storedRole = localStorage.getItem('selectedRole') as UserRole;
      const storedLang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
      
      if (mockAuth) {
        setIsAuthenticated(true);
        if (mockAuth === 'admin') setUserType('admin');
        else if (mockAuth === 'doctor') setUserType('doctor');
        else if (storedRole) setUserType(storedRole);
        else setUserType('patient'); 
      } else {
        setUserType(null);
        setIsAuthenticated(false);
      }
      if (storedLang) {
        setPreferredLanguage(storedLang);
      } else {
        localStorage.setItem('mockUserLang', 'kn'); 
      }

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mockUserLang') {
          setPreferredLanguage((event.newValue as 'en' | 'kn') || 'kn');
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);

    }
  }, [isClient]);
  return { userType, isAuthenticated, isClient, preferredLanguage };
};


export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { userType, isAuthenticated, isClient, preferredLanguage } = useAuth();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  const t = (label: string, labelKn: string) => preferredLanguage === 'kn' ? labelKn : label;

  useEffect(() => {
    const currentOpenSubMenus: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href))) {
        currentOpenSubMenus[item.label] = true;
      }
    });
    setOpenSubMenus(prev => ({...prev, ...currentOpenSubMenus}));
  }, [pathname]);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  if (!isClient) {
    return (
      <div className={cn("flex flex-col space-y-1 p-2", className)}>
        {[...Array(12)].map((_, i) => ( 
          <div key={i} className="h-8 w-full bg-sidebar-accent/30 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  const isPatientOrSeeker = userType === 'patient' || userType === 'seeker';

  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresAuth && !isAuthenticated) return true; 
    if (!isAuthenticated) return false; 
    if (item.adminOnly && userType !== 'admin') return false;
    if (item.doctorOnly && userType !== 'doctor') return false;
    if (item.patientOnly && (!isPatientOrSeeker || userType === 'admin' || userType === 'doctor')) return false;
    
    if (!item.adminOnly && !item.doctorOnly && !item.patientOnly) return true;

    if (item.adminOnly && userType === 'admin') return true;
    if (item.doctorOnly && userType === 'doctor') return true;
    if (item.patientOnly && isPatientOrSeeker) return true;

    return false; 
  });

  return (
    <nav
      className={cn("flex flex-col space-y-1 text-sm font-medium text-sidebar-foreground", className)}
      {...props}
    >
      <SidebarMenu>
        {filteredNavItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            {!item.subItems ? (
              <Link href={item.href}>
                <SidebarMenuButton
                  asChild
                  variant="default"
                  size="default"
                  isActive={pathname === item.href}
                  tooltip={t(item.label, item.labelKn)}
                  className={cn(
                    "justify-start w-full transition-all duration-200 ease-in-out hover:pl-3",
                    pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span>
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{t(item.label, item.labelKn)}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            ) : (
              <>
                <SidebarMenuButton
                  variant="default"
                  size="default"
                  isActive={item.subItems.some(sub => pathname.startsWith(sub.href))}
                  tooltip={t(item.label, item.labelKn)}
                  onClick={() => toggleSubMenu(item.label)}
                  className={cn(
                    "justify-between w-full transition-all duration-200 ease-in-out", 
                     item.subItems.some(sub => pathname.startsWith(sub.href)) ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="flex items-center truncate">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{t(item.label, item.labelKn)}</span>
                  </span>
                  {openSubMenus[item.label] ? <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200" /> : <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />}
                </SidebarMenuButton>
                {openSubMenus[item.label] && (
                  <SidebarMenuSub className="mt-1">
                    {item.subItems.filter(subItem => {
                        if (!subItem.requiresAuth && !isAuthenticated) return true;
                        if (!isAuthenticated) return false;
                        if (subItem.adminOnly && userType !== 'admin') return false;
                        if (subItem.doctorOnly && userType !== 'doctor') return false;
                         if (subItem.patientOnly && (!isPatientOrSeeker || userType === 'admin' || userType === 'doctor')) return false;
                        return true;
                    }).map((subItem) => (
                       <SidebarMenuSubItem key={subItem.href}>
                         <Link href={subItem.href}>
                           <SidebarMenuSubButton
                             asChild
                             size="md"
                             isActive={pathname === subItem.href}
                             className={cn(
                               "transition-all duration-150 ease-in-out hover:pl-1",
                               pathname === subItem.href ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                             )}
                           >
                             <span className="flex items-center">
                              <subItem.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{t(subItem.label, subItem.labelKn)}</span>
                             </span>
                           </SidebarMenuSubButton>
                         </Link>
                       </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
