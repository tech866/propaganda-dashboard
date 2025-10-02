'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Navigation, NavigationGroup, NavigationItem } from '@/components/ui/navigation';
import { 
  LayoutDashboard, 
  Phone, 
  PhoneCall, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Shield,
  Activity,
  Building2,
  Plug,
  TrendingUp
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
    name: 'Client Management',
    href: '/clients',
    icon: Building2,
    description: 'Manage client accounts and settings',
    requiredRoles: ['admin', 'ceo']
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: Plug,
    description: 'Manage external service connections and data sync'
  },
  {
    name: 'Performance',
    href: '/performance',
    icon: TrendingUp,
    description: 'Advanced analytics and performance metrics'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Manage account preferences and system configuration'
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

  const getRoleVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'ceo':
        return 'default';
      case 'admin':
        return 'info';
      case 'sales':
        return 'success';
      case 'agency_user':
        return 'secondary';
      case 'client_user':
        return 'outline';
      default:
        return 'muted';
    }
  };

  // Group items by category
  const mainItems = accessibleItems.filter(item => 
    ['Dashboard', 'Log Call', 'View Calls', 'Client Workspaces', 'Integrations', 'Performance', 'Client Management'].includes(item.name)
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
        {/* Premium Logo/Brand Section */}
        <div className="p-8 border-b border-sidebar-border">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight">Propaganda</h1>
              <p className="text-sm text-muted-foreground font-medium">Agency Dashboard</p>
            </div>
          </div>
        </div>

            {/* Navigation with Tailus Components */}
            <div className="flex-1 p-6">
              <Navigation>
                <NavigationGroup>
                  {mainItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavigationItem
                        key={item.name}
                        icon={<Icon className="h-5 w-5" />}
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
                          icon={<Icon className="h-5 w-5" />}
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
                          icon={<Icon className="h-5 w-5" />}
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

        {/* Premium User Info Footer */}
        <div className="p-6 border-t border-sidebar-border">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.name || 'User'}
              </p>
              <Badge 
                variant={getRoleVariant(user?.role) as any}
                className="text-xs mt-1 font-medium"
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
