
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
  ShieldCheck,
  ChevronDown,
  ChevronRight
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
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/medicines', label: 'Order Medicines', icon: Pill },
  { href: '/medical-tests', label: 'Medical Tests', icon: ClipboardList },
  { href: '/symptom-analyzer', label: 'Symptom Analyzer', icon: ActivitySquare },
  { href: '/faq', label: 'Medical FAQ', icon: MessageSquareQuote },
  { href: '/test-yourself', label: 'Test Yourself', icon: FlaskConical },
  { href: '/online-consultation', label: 'Online Consultation', icon: Video },
  { href: '/payment', label: 'Make Payment', icon: CreditCard },
  { 
    href: '#admin-section', // Changed to # to prevent navigation if only used as a trigger
    label: 'Admin Section', 
    icon: LayoutDashboard, 
    adminOnly: true,
    subItems: [
      { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Manage Users', icon: Users },
      { href: '/admin/inventory', label: 'Manage Inventory', icon: Pill },
      { href: '/admin/services', label: 'Manage Services', icon: Settings },
      { href: '/admin/analytics', label: 'Analytics', icon: Stethoscope },
      { href: '/admin/settings', label: 'System Settings', icon: Settings },
    ]
  },
];

const useAuth = () => {
  const [userType, setUserType] = useState<'patient' | 'admin' | null>(null);
  useEffect(() => {
    const mockAuth = localStorage.getItem('mockAuth');
    if (mockAuth === 'admin') {
      setUserType('admin');
    } else if (mockAuth === 'patient') {
      setUserType('patient');
    }
  }, []);
  return { userType };
};


export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { userType } = useAuth();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  useEffect(() => {
    // Pre-open admin submenu if current path is an admin path
    const isAdminPath = navItems.find(item => item.label === 'Admin Section' && item.subItems?.some(sub => pathname.startsWith(sub.href)));
    if (isAdminPath) {
      setOpenSubMenus(prev => ({ ...prev, 'Admin Section': true }));
    }
  }, [pathname]);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredNavItems = navItems.filter(item => !item.adminOnly || (item.adminOnly && userType === 'admin'));

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
                  variant="default"
                  size="default"
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    "justify-start w-full transition-colors duration-150 ease-in-out",
                    pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
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
                    "justify-between w-full transition-colors duration-150 ease-in-out", // Ensure justify-between for arrow
                     item.subItems.some(sub => pathname.startsWith(sub.href)) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                    {item.subItems.map((subItem) => (
                       <SidebarMenuSubItem key={subItem.href}>
                         <Link href={subItem.href}>
                           <SidebarMenuSubButton
                             size="md"
                             isActive={pathname === subItem.href}
                             className={cn(
                               "transition-colors duration-150 ease-in-out",
                               pathname === subItem.href ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                             )}
                           >
                             <subItem.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                             <span className="truncate">{subItem.label}</span>
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
