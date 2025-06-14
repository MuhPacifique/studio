
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
  ClipboardList as ClipboardListIcon, // Renamed to avoid conflict
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
  FileHeart // New icon for My Health
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
  icon: React.ElementType;
  adminOnly?: boolean;
  doctorOnly?: boolean;
  patientOnly?: boolean; // For patient/seeker specific items
  subItems?: NavItem[];
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home, requiresAuth: true },
  { href: '/medicines', label: 'Order Medicines', icon: Pill, requiresAuth: true, patientOnly: true },
  { href: '/medical-tests', label: 'Medical Tests', icon: ClipboardListIcon, requiresAuth: true, patientOnly: true },
  { 
    href: '#appointments', 
    label: 'Appointments', 
    icon: CalendarCheck2, 
    requiresAuth: true,
    patientOnly: true,
    subItems: [
      { href: '/appointments/book', label: 'Book Appointment', icon: CalendarPlus, requiresAuth: true, patientOnly: true },
      { href: '/appointments/my-appointments', label: 'My Appointments', icon: CalendarCheck2, requiresAuth: true, patientOnly: true },
    ]
  },
  { 
    href: '#my-health', 
    label: 'My Health', 
    icon: FileHeart, 
    requiresAuth: true,
    patientOnly: true, // Assuming prescriptions are primarily for patients
    subItems: [
      { href: '/my-health/prescriptions', label: 'My Prescriptions', icon: ClipboardListIcon, requiresAuth: true, patientOnly: true },
      // Add more "My Health" items like Medical Records if needed
    ]
  },
  { 
    href: '#health-resources', 
    label: 'Health Resources', 
    icon: LifeBuoy, 
    requiresAuth: true,
    subItems: [
      { href: '/health-resources/articles', label: 'Educational Articles', icon: BookOpen, requiresAuth: true },
      { href: '/health-resources/wellness-tips', label: 'Wellness Tips', icon: HeartPulse, requiresAuth: true },
    ]
  },
  { 
    href: '#community-support', 
    label: 'Community & Support', 
    icon: Users2, 
    requiresAuth: true,
    subItems: [
      { href: '/community-support/forums', label: 'Patient Forums', icon: MessageCircleQuestion, requiresAuth: true },
      { href: '/community-support/support-groups', label: 'Support Groups', icon: Users2, requiresAuth: true },
    ]
  },
  { href: '/symptom-analyzer', label: 'Symptom Analyzer', icon: ActivitySquare, requiresAuth: true },
  { href: '/faq', label: 'Medical FAQ', icon: MessageSquareQuote, requiresAuth: true },
  { href: '/test-yourself', label: 'Test Yourself', icon: FlaskConical, requiresAuth: true },
  { href: '/online-consultation', label: 'Online Consultation', icon: Video, requiresAuth: true },
  { href: '/payment', label: 'Make Payment', icon: CreditCard, requiresAuth: true, patientOnly: true },
  { 
    href: '/doctor/dashboard', 
    label: 'Doctor Portal', 
    icon: Stethoscope, 
    doctorOnly: true, 
    requiresAuth: true, 
    subItems: [
        { href: '/doctor/dashboard', label: 'Doctor Overview', icon: LayoutDashboard, doctorOnly: true, requiresAuth: true },
        { href: '/doctor/prescribe', label: 'Prescribe / Advise', icon: ClipboardListIcon, doctorOnly: true, requiresAuth: true },
        // Add more doctor-specific sub-items here
    ]
  },
  { 
    href: '#admin-section', 
    label: 'Admin Section', 
    icon: LayoutDashboard, 
    adminOnly: true,
    requiresAuth: true,
    subItems: [
      { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, adminOnly: true, requiresAuth: true },
      { href: '/admin/users', label: 'Manage Users', icon: Users, adminOnly: true, requiresAuth: true },
      { href: '/admin/inventory', label: 'Manage Inventory', icon: Pill, adminOnly: true, requiresAuth: true },
      { href: '/admin/services', label: 'Manage Services', icon: Settings, adminOnly: true, requiresAuth: true },
      { href: '/admin/analytics', label: 'Analytics', icon: Stethoscope, adminOnly: true, requiresAuth: true },
      { href: '/admin/settings', label: 'System Settings', icon: Settings, adminOnly: true, requiresAuth: true },
    ]
  },
];

type UserRole = 'patient' | 'admin' | 'doctor' | 'seeker' | null;

const useAuth = () => {
  const [userType, setUserType] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const mockAuth = localStorage.getItem('mockAuth');
      const storedRole = localStorage.getItem('selectedRole') as UserRole;
      
      if (mockAuth) {
        setIsAuthenticated(true);
        // Prioritize mockAuth if it's 'admin' or 'doctor', otherwise use selectedRole
        if (mockAuth === 'admin') setUserType('admin');
        else if (mockAuth === 'doctor') setUserType('doctor');
        else if (storedRole) setUserType(storedRole);
        else setUserType('patient'); // Fallback for general authenticated user
      } else {
        setUserType(null);
        setIsAuthenticated(false);
      }
    }
  }, [isClient]);
  return { userType, isAuthenticated, isClient };
};


export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { userType, isAuthenticated, isClient } = useAuth();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

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
    // Show 'patientOnly' items if user is patient or seeker, and not admin or doctor
    if (item.patientOnly && (!isPatientOrSeeker || userType === 'admin' || userType === 'doctor')) return false;
    
    // If item is not adminOnly, not doctorOnly, and not patientOnly, show to all authenticated users
    if (!item.adminOnly && !item.doctorOnly && !item.patientOnly) return true;

    // If it's an admin item and user is admin
    if (item.adminOnly && userType === 'admin') return true;
    // If it's a doctor item and user is doctor
    if (item.doctorOnly && userType === 'doctor') return true;
    // If it's a patient/seeker item and user is patient/seeker
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
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  variant="default"
                  size="default"
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    "justify-start w-full transition-all duration-200 ease-in-out hover:pl-3",
                    pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span>
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            ) : (
              <>
                <SidebarMenuButton
                  variant="default"
                  size="default"
                  isActive={item.subItems.some(sub => pathname.startsWith(sub.href))}
                  tooltip={item.label}
                  onClick={() => toggleSubMenu(item.label)}
                  className={cn(
                    "justify-between w-full transition-all duration-200 ease-in-out", 
                     item.subItems.some(sub => pathname.startsWith(sub.href)) ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="flex items-center truncate">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
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
                         <Link href={subItem.href} passHref legacyBehavior>
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
                              <span className="truncate">{subItem.label}</span>
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
