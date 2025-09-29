'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { 
  LayoutDashboard, 
  BarChart2, 
  Users, 
  Settings, 
  FileText,
  ChevronDown,
  Search,
  RefreshCw,
  Eye,
  Code,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiresRole?: string[];
}

const getAllNavigationItems = (): NavigationItem[] => [
  { name: 'OVERVIEW', href: '/dashboard', icon: BarChart2 },
  { name: 'PERFORMANCE', href: '/performance', icon: BarChart2 },
  { name: 'CLIENT MANAGEMENT', href: '/admin/clients', icon: FileText, requiresRole: ['admin', 'ceo'] },
  { name: 'SETTINGS', href: '/settings', icon: Settings },
];

interface V0DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function V0DashboardLayout({ children, className }: V0DashboardLayoutProps) {
  const pathname = usePathname();
  const { hasAnyRole } = useRole();

  const isActive = (href: string) => pathname === href;

  // Filter navigation items based on user role
  const navigationItems = getAllNavigationItems().filter(item => {
    if (!item.requiresRole) return true;
    return hasAnyRole(item.requiresRole as any);
  });

         return (
           <div className="min-h-screen gradient-bg text-white">
             {/* Top Header Bar - Modern glassmorphism design */}
             <header className="modern-header border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Center - Search/Path */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Input 
                value="/" 
                className="bg-gray-900 border-gray-700 text-white text-sm pl-3 pr-10"
                readOnly
              />
              <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Right side - Version and Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  v35
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-700">
                <DropdownMenuItem className="text-white hover:bg-gray-800">v35</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-800">v34</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-800">v33</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <FileText className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
               {/* Sidebar - Modern glassmorphism design */}
               <aside className="modern-sidebar w-64 border-r border-white/10 p-6">
          {/* Logo Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">Agency Dashboard</h1>
            </div>
            <p className="text-sm text-gray-400">Client Tracking System</p>
          </div>

          {/* Navigation Section */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">NAVIGATION</h2>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                    isActive(item.href) 
                      ? "bg-gray-800 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {isActive(item.href) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

                 {/* User Profile Section */}
                 <div className="mt-auto">
                   <div className="flex items-center space-x-3 p-3 rounded-lg modern-card">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-600 text-white text-sm">SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">SARAH J...</p>
                <p className="text-xs text-gray-400">CEO</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn("flex-1 p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
