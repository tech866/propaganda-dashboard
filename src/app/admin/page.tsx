'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useRole, RoleGuard, PermissionGuard } from '@/contexts/RoleContext';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Settings, Shield, BarChart3, Activity, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const { hasAnyRole, canManageUsers } = useRole();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user && !hasAnyRole(['admin', 'ceo'])) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router, hasAnyRole]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAnyRole(['admin', 'ceo'])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-h2">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ModernDashboardLayout>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-display">Admin Management</h1>
              <p className="text-body-lg text-muted-foreground">
                Manage users, loss reasons, and system configuration
              </p>
            </div>
          </div>
        </div>

        {/* Admin Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <PermissionGuard permission="manage_users">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-h3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
                      User Management
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Create, edit, and manage user accounts and permissions across the platform
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200">
                    <Link href="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                      <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 text-white transition-all duration-200">
                    <Link href="/admin/users/new">
                      Create New User
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>

          {/* Loss Reasons Management */}
          <PermissionGuard permission="manage_loss_reasons">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                    <FileText className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-h3 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">
                      Loss Reasons
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage loss reason categories
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Configure and manage loss reason categories for call tracking and analytics
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200">
                    <Link href="/admin/loss-reasons">
                      <FileText className="w-4 h-4 mr-2" />
                      Manage Loss Reasons
                      <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 text-white transition-all duration-200">
                    <Link href="/admin/loss-reasons/new">
                      Add New Reason
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>

          {/* System Configuration */}
          <PermissionGuard permission="manage_system_config">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
                    <Settings className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-h3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300">
                      System Config
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure system settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Configure system settings, roles, permissions, and audit logging
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200">
                    <Link href="/admin/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                      <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 text-white transition-all duration-200">
                    <Link href="/admin/audit-logs">
                      <Activity className="w-4 h-4 mr-2" />
                      Audit Logs
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PermissionGuard>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-h3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
              System Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Users className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">-</p>
                    <p className="text-xs text-gray-500">Active accounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
                    <FileText className="w-7 h-7 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Loss Reasons</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">-</p>
                    <p className="text-xs text-gray-500">Configured categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <Activity className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Sessions</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300">-</p>
                    <p className="text-xs text-gray-500">Current users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </ModernDashboardLayout>
  );
}
