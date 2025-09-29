'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRole, RoleGuard, PermissionGuard } from '@/contexts/RoleContext';
import DashboardNavigation from '@/components/navigation/DashboardNavigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Settings, Shield, BarChart3, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, hasAnyRole, canManageUsers } = useRole();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (!hasAnyRole(['admin', 'ceo'])) {
      router.push('/dashboard');
    }
  }, [status, router, hasAnyRole]);

  if (status === 'loading') {
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <DashboardNavigation />

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
            <Card className="card-modern hover:shadow-modern-hover transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-h3">User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Create, edit, and manage user accounts and permissions
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
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
            <Card className="card-modern hover:shadow-modern-hover transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-h3">Loss Reasons</CardTitle>
                    <CardDescription>Manage loss reason categories</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Configure and manage loss reason categories for call tracking
                </p>
                <div className="space-y-2">
                  <Button asChild variant="destructive" className="w-full">
                    <Link href="/admin/loss-reasons">
                      <FileText className="w-4 h-4 mr-2" />
                      Manage Loss Reasons
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
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
            <Card className="card-modern hover:shadow-modern-hover transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-h3">System Config</CardTitle>
                    <CardDescription>Configure system settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Configure system settings, roles, and permissions
                </p>
                <div className="space-y-2">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/admin/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
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
        <div className="mt-8">
          <h2 className="text-h3 mb-6">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-semibold text-foreground">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Loss Reasons</p>
                    <p className="text-2xl font-semibold text-foreground">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-semibold text-foreground">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
