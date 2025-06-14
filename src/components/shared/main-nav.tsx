
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
  ClipboardList,
  Users,
  Settings,
  BookOpen, 
  HeartPulse, 
  LifeBuoy, 
  ChevronDown,
  ChevronRight,
  MessageCircleQuestion, // Placeholder for Forums
  Users2 // Placeholder for Support Groups
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
  subItems?: NavItem[];
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home, requiresAuth: true },
  { href: '/medicines', label: 'Order Medicines', icon: Pill, requiresAuth: true },
  { href: '/medical-tests', label: 'Medical Tests', icon: ClipboardList, requiresAuth: true },
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
  { href: '/payment', label: 'Make Payment', icon: CreditCard, requiresAuth: true },
  { 
    href: '#admin-section', 
    label: 'Admin Section', 
    icon: LayoutDashboard, 
    adminOnly: true,
    subItems: [
      { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, adminOnly: true },
      { href: '/admin/users', label: 'Manage Users', icon: Users, adminOnly: true },
      { href: '/admin/inventory', label: 'Manage Inventory', icon: Pill, adminOnly: true },
      { href: '/admin/services', label: 'Manage Services', icon: Settings, adminOnly: true },
      { href: '/admin/analytics', label: 'Analytics', icon: Stethoscope, adminOnly: true },
      { href: '/admin/settings', label: 'System Settings', icon: Settings, adminOnly: true },
    ]
  },
];

const useAuth = () => {
  const [userType, setUserType] = useState<'patient' | 'admin' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const mockAuth = localStorage.getItem('mockAuth');
      if (mockAuth === 'admin') {
        setUserType('admin');
        setIsAuthenticated(true);
      } else if (mockAuth === 'patient') {
        setUserType('patient');
        setIsAuthenticated(true);
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
        {[...Array(10)].map((_, i) => ( // Increased skeleton items
          <div key={i} className="h-8 w-full bg-sidebar-accent/30 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return userType === 'admin';
    }
    if (item.requiresAuth) {
      return isAuthenticated;
    }
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
              <Link href={item.href}>
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
                  <div className="flex items-center truncate">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {openSubMenus[item.label] ? <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200" /> : <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />}
                </SidebarMenuButton>
                {openSubMenus[item.label] && (
                  <SidebarMenuSub className="mt-1">
                    {item.subItems.filter(subItem => !subItem.adminOnly || userType === 'admin').map((subItem) => (
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
                             <span>
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
