'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  ChevronDown,
  Monitor,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';

interface DarkDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const navigationItems = [
  {
    name: 'OVERVIEW',
    href: '/dashboard',
    icon: BarChart3,
    active: true
  },
  {
    name: 'PERFORMANCE...',
    href: '/performance',
    icon: TrendingUp,
    active: false
  },
  {
    name: 'CLIENT MANA...',
    href: '/clients',
    icon: FileText,
    active: false
  },
  {
    name: 'SETTINGS',
    href: '/settings',
    icon: Settings,
    active: false
  }
];

export default function DarkDashboardLayout({ children, className }: DarkDashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { hasAnyRole } = useRole();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="dashboard-dark min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <div className="dashboard-header flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Agency Dashboard</h1>
              <p className="text-sm text-gray-400">Client Tracking System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">v35</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          <Monitor className="h-5 w-5 text-gray-400" />
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white">CEO</span>
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="dashboard-sidebar">
          <nav className="p-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "nav-item flex items-center space-x-3",
                  isActive(item.href) ? "active" : ""
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">SJ</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Sarah J.</p>
                <p className="text-xs text-gray-400">CEO</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main flex-1">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">insights and financial performance.</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Last 30 days</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <button className="btn-secondary flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>FILTERS</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>EXPORT</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={cn("", className)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
