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
  ShieldCheck
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
    href: '/admin/dashboard', 
    label: 'Admin Section', 
    icon: LayoutDashboard, 
    adminOnly: true,
    subItems: [
      { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Manage Users', icon: Users },
      { href: '/admin/inventory', label: 'Manage Inventory', icon: Pill },
      { href: '/admin/services', label: 'Manage Services', icon: Settings },
    ]
  },
];

// Mock authentication state for determining admin access
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
          <SidebarMenuItem key={item.href}>
            {!item.subItems ? (
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  variant="default"
                  size="default"
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    "justify-start w-full",
                    pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
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
                    "justify-start w-full",
                     item.subItems.some(sub => pathname.startsWith(sub.href)) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </SidebarMenuButton>
                {openSubMenus[item.label] && (
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                       <SidebarMenuSubItem key={subItem.href}>
                         <Link href={subItem.href} legacyBehavior passHref>
                           <SidebarMenuSubButton
                             size="md"
                             isActive={pathname === subItem.href}
                             className={cn(
                               pathname === subItem.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                             )}
                           >
                             <subItem.icon className="mr-2 h-4 w-4" />
                             {subItem.label}
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
