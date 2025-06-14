
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
  patientOrSeekerOnly?: boolean; // Changed from patientOnly to be more inclusive
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', labelKn: 'Imbonerahamwe', icon: Home },
  { href: '/medicines', label: 'Order Medicines', labelKn: 'Gura Imiti', icon: Pill, patientOrSeekerOnly: true },
  { href: '/medical-tests', label: 'Medical Tests', labelKn: 'Ibipimo bya Muganga', icon: ClipboardListIcon, patientOrSeekerOnly: true },
  { 
    href: '#appointments', 
    label: 'Appointments', 
    labelKn: 'Amateraniro',
    icon: CalendarCheck2, 
    patientOrSeekerOnly: true,
    subItems: [
      { href: '/appointments/book', label: 'Book Appointment', labelKn: 'Fata Igihe', icon: CalendarPlus, patientOrSeekerOnly: true },
      { href: '/appointments/my-appointments', label: 'My Appointments', labelKn: 'Amateraniro Yanjye', icon: CalendarCheck2, patientOrSeekerOnly: true },
    ]
  },
  { 
    href: '#my-health', 
    label: 'My Health', 
    labelKn: 'Ubuzima Bwanjye',
    icon: FileHeart, 
    patientOrSeekerOnly: true, 
    subItems: [
      { href: '/my-health/prescriptions', label: 'My Prescriptions', labelKn: 'Imiti Nandikiwe', icon: ClipboardListIcon, patientOrSeekerOnly: true },
    ]
  },
  { 
    href: '#health-resources', 
    label: 'Health Resources', 
    labelKn: 'Amakuru y\'Ubuzima',
    icon: LifeBuoy, 
    subItems: [
      { href: '/health-resources/articles', label: 'Educational Articles', labelKn: 'Inyandiko Zigisha', icon: BookOpen },
      { href: '/health-resources/wellness-tips', label: 'Wellness Tips', labelKn: 'Inama z\'Ubuzima', icon: HeartPulse },
    ]
  },
  { 
    href: '#community-support', 
    label: 'Community & Support', 
    labelKn: 'Ubufatanye & Ubufasha',
    icon: Users2, 
    subItems: [
      { href: '/community-support/forums', label: 'Patient Forums', labelKn: 'Ibiganiro by\'Abarwayi', icon: MessageCircleQuestion },
      { href: '/community-support/support-groups', label: 'Support Groups', labelKn: 'Amatsinda y\'Ubufasha', icon: Users2 },
    ]
  },
  { href: '/symptom-analyzer', label: 'Symptom Analyzer', labelKn: 'Isesengura ry\'Ibimenyetso', icon: ActivitySquare },
  { href: '/faq', label: 'Medical FAQ', labelKn: 'Ibibazo Bikunze Kubazwa', icon: MessageSquareQuote },
  { href: '/test-yourself', label: 'Test Yourself', labelKn: 'Isúzumé Ubwawe', icon: FlaskConical },
  { href: '/online-consultation', label: 'Online Consultation', labelKn: 'Ubujyanama kuri Interineti', icon: Video },
  { href: '/payment', label: 'Make Payment', labelKn: 'Kwishyura', icon: CreditCard, patientOrSeekerOnly: true },
  { 
    href: '/doctor/dashboard', 
    label: 'Doctor Portal', 
    labelKn: 'Irembo rya Muganga',
    icon: Stethoscope, 
    doctorOnly: true, 
    subItems: [
        { href: '/doctor/dashboard', label: 'Doctor Overview', labelKn: 'Incámáke ya Muganga', icon: LayoutDashboard, doctorOnly: true },
        { href: '/doctor/prescribe', label: 'Prescribe / Advise', labelKn: 'Kwandika Imiti / Inama', icon: ClipboardListIcon, doctorOnly: true },
    ]
  },
  { 
    href: '#admin-section', 
    label: 'Admin Section', 
    labelKn: 'Igice cy\'Ubuyobozi',
    icon: LayoutDashboard, 
    adminOnly: true,
    subItems: [
      { href: '/admin/dashboard', label: 'Overview', labelKn: 'Incámáke', icon: LayoutDashboard, adminOnly: true },
      { href: '/admin/users', label: 'Manage Users', labelKn: 'Gucunga Abakoresha', icon: Users, adminOnly: true },
      { href: '/admin/inventory', label: 'Manage Inventory', labelKn: 'Gucunga Ububiko', icon: Pill, adminOnly: true },
      { href: '/admin/services', label: 'Manage Services', labelKn: 'Gucunga Serivisi', icon: Settings, adminOnly: true },
      { href: '/admin/analytics', label: 'Analytics', labelKn: 'Isesengura', icon: Stethoscope, adminOnly: true },
      { href: '/admin/settings', label: 'System Settings', labelKn: 'Igenamiterere rya Sisitemu', icon: Settings, adminOnly: true },
    ]
  },
];

// Since localStorage is removed, userType and isAuthenticated will be hardcoded or managed by a (future) global state.
// For this prototype, we'll assume a default state or allow manual toggling for testing.
const useAuthSimulator = () => {
  // To test different roles, you can change this value:
  // const simulatedUserType: 'patient' | 'admin' | 'doctor' | 'seeker' | null = 'patient';
  // const simulatedIsAuthenticated = true;

  // Default to a logged-out state for the purpose of this refactor
  const simulatedUserType: 'patient' | 'admin' | 'doctor' | 'seeker' | null = null;
  const simulatedIsAuthenticated = false;
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return { 
    userType: simulatedIsAuthenticated ? simulatedUserType : null, 
    isAuthenticated: simulatedIsAuthenticated, 
    isClient,
    preferredLanguage: 'kn' as 'en' | 'kn' // Default to Kinyarwanda
  };
};


export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { userType, isAuthenticated, isClient, preferredLanguage } = useAuthSimulator();
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
  
  const filteredNavItems = navItems.filter(item => {
    if (!isAuthenticated) { // If not authenticated, show only items that don't require auth (none in current list)
        // If we had public items, they would be returned here.
        // For now, all items imply some level of auth or role.
        // To make the sidebar useful in a "logged out" state, we might show a few public links or all links disabled.
        // For this iteration, if not authenticated, the sidebar will be empty as per current navItems structure.
        // Or, we can show all and let page-level guards handle redirection.
        // Let's show all for layout purposes, page guards would handle access.
        return true; // This will show all items, page guards will handle access.
    }
    if (item.adminOnly && userType !== 'admin') return false;
    if (item.doctorOnly && userType !== 'doctor') return false;
    if (item.patientOrSeekerOnly && !(userType === 'patient' || userType === 'seeker')) return false;
    
    return true; 
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
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  asChild
                  variant="default"
                  size="default"
                  isActive={pathname === item.href}
                  tooltip={t(item.label, item.labelKn)}
                  className={cn(
                    "justify-start w-full transition-all duration-200 ease-in-out hover:pl-3",
                    !isAuthenticated ? "opacity-50 cursor-not-allowed" : "",
                    pathname === item.href && isAuthenticated ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  disabled={!isAuthenticated && item.href !== '/'} // Disable if not auth, except dashboard for demo
                  onClick={(e) => { if (!isAuthenticated && item.href !== '/') e.preventDefault(); }}
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
                  isActive={item.subItems.some(sub => pathname.startsWith(sub.href)) && isAuthenticated}
                  tooltip={t(item.label, item.labelKn)}
                  onClick={() => { if (isAuthenticated) toggleSubMenu(item.label); }}
                  className={cn(
                    "justify-between w-full transition-all duration-200 ease-in-out", 
                    !isAuthenticated ? "opacity-50 cursor-not-allowed" : "",
                    item.subItems.some(sub => pathname.startsWith(sub.href)) && isAuthenticated ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  disabled={!isAuthenticated}
                >
                  <span className="flex items-center truncate">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{t(item.label, item.labelKn)}</span>
                  </span>
                  {isAuthenticated && (openSubMenus[item.label] ? <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200" /> : <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />)}
                </SidebarMenuButton>
                {isAuthenticated && openSubMenus[item.label] && (
                  <SidebarMenuSub className="mt-1">
                    {item.subItems.filter(subItem => {
                        if (subItem.adminOnly && userType !== 'admin') return false;
                        if (subItem.doctorOnly && userType !== 'doctor') return false;
                        if (subItem.patientOrSeekerOnly && !(userType === 'patient' || userType === 'seeker')) return false;
                        return true;
                    }).map((subItem) => (
                       <SidebarMenuSubItem key={subItem.href}>
                         <Link href={subItem.href} passHref>
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
