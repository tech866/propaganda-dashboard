'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { Navigation, NavigationGroup, NavigationItem } from '@/components/ui/navigation';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Phone, 
  PhoneCall, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Shield,
  Activity
} from 'lucide-react';

interface SidebarNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  description?: string;
  badge?: string | number;
}

const navigationItems: SidebarNavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'View your dashboard and metrics'
  },
  {
    name: 'Log Call',
    href: '/calls/new',
    icon: Phone,
    description: 'Log a new call'
  },
  {
    name: 'View Calls',
    href: '/calls',
    icon: PhoneCall,
    description: 'View all your calls'
  },
  {
    name: 'Manage Users',
    href: '/admin/users/new',
    icon: Users,
    requiredRoles: ['admin', 'ceo'],
    description: 'Manage user accounts and permissions'
  },
  {
    name: 'Audit Logs',
    href: '/audit',
    icon: Shield,
    requiredRoles: ['admin', 'ceo'],
    description: 'View system audit logs and activity'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    requiredRoles: ['admin', 'ceo'],
    description: 'View detailed reports and analytics'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredRoles: ['ceo'],
    description: 'System settings and configuration'
  }
];

interface ModernSidebarProps {
  className?: string;
}

export default function ModernSidebar({ className = '' }: ModernSidebarProps) {
  const pathname = usePathname();
  const { user, hasAnyRole, hasPermission } = useRole();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const canAccessItem = (item: SidebarNavigationItem) => {
    // If no role requirements, everyone can access
    if (!item.requiredRoles && !item.requiredPermissions) {
      return true;
    }

    // Check role requirements
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      if (!hasAnyRole(item.requiredRoles as any)) {
        return false;
      }
    }

    // Check permission requirements
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      const hasAllPermissions = item.requiredPermissions.every(permission => hasPermission(permission));
      if (!hasAllPermissions) {
        return false;
      }
    }

    return true;
  };

  const accessibleItems = navigationItems.filter(canAccessItem);

  // Group items by category
  const mainItems = accessibleItems.filter(item => 
    ['Dashboard', 'Log Call', 'View Calls'].includes(item.name)
  );
  const adminItems = accessibleItems.filter(item => 
    ['Manage Users', 'Audit Logs', 'Reports'].includes(item.name)
  );
  const settingsItems = accessibleItems.filter(item => 
    ['Settings'].includes(item.name)
  );

  return (
    <aside className={cn("sidebar-modern", className)}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-h4 text-sidebar-foreground">Propaganda</h1>
              <p className="text-caption text-sidebar-foreground/60">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <Navigation>
            <NavigationGroup>
              {mainItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavigationItem
                    key={item.name}
                    icon={<Icon className="h-4 w-4" />}
                    label={item.name}
                    isActive={isActive(item.href)}
                    href={item.href}
                    badge={item.badge}
                  />
                );
              })}
            </NavigationGroup>

            {adminItems.length > 0 && (
              <NavigationGroup title="Administration">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavigationItem
                      key={item.name}
                      icon={<Icon className="h-4 w-4" />}
                      label={item.name}
                      isActive={isActive(item.href)}
                      href={item.href}
                      badge={item.badge}
                    />
                  );
                })}
              </NavigationGroup>
            )}

            {settingsItems.length > 0 && (
              <NavigationGroup title="Settings">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavigationItem
                      key={item.name}
                      icon={<Icon className="h-4 w-4" />}
                      label={item.name}
                      isActive={isActive(item.href)}
                      href={item.href}
                      badge={item.badge}
                    />
                  );
                })}
              </NavigationGroup>
            )}
          </Navigation>
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'User'}
              </p>
              <Badge 
                variant="muted" 
                className="text-xs mt-1"
              >
                {user?.role?.toUpperCase() || 'USER'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
