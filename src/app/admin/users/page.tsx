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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Search, RefreshCw, Shield, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'sales' | 'admin' | 'ceo';
  clientId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersManagement() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const { hasAnyRole, canManageUsers } = useRole();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user && !hasAnyRole(['admin', 'ceo'])) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router, hasAnyRole]);

  useEffect(() => {
    if (hasAnyRole(['admin', 'ceo'])) {
      fetchUsers();
    }
  }, [hasAnyRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/users');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch users');
      }
      
      setUsers(result.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete user');
      }

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to update user status');
      }

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/admin')} 
                className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-110"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  User Management
                </h1>
                <p className="text-lg text-gray-400 mt-2">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105">
              <Link href="/admin/users/new">
                <UserPlus className="w-4 h-4 mr-2" />
                Create New User
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">Filters & Controls</Badge>
            </div>
            <CardTitle className="text-h4 text-white">Search and Filter Users</CardTitle>
            <CardDescription className="text-gray-400">Filter users by various criteria to find what you're looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search Users</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Filter by Role</span>
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="sales">Sales</option>
                  <option value="admin">Admin</option>
                  <option value="ceo">CEO</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Filter by Status</span>
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:border-blue-500/50 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchUsers}
                  variant="outline"
                  className="w-full bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 text-white transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive/20 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Data Analysis</Badge>
            </div>
            <CardTitle className="text-h4 text-white">Users</CardTitle>
            <CardDescription className="text-gray-400">Manage user accounts and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700/50 hover:bg-slate-700/30">
                      <TableHead className="text-gray-300 font-semibold">User</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Role</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Client ID</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Created</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-200">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.role === 'ceo' ? 'default' :
                              user.role === 'admin' ? 'secondary' :
                              'success'
                            }
                            className="font-medium"
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 font-mono text-sm">
                          {user.clientId}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={user.isActive ? "success" : "destructive"}
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            className="font-medium"
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Button>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                              <Link href={`/admin/users/${user.id}/edit`}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Showing <span className="text-white font-medium">{filteredUsers.length}</span> of <span className="text-white font-medium">{users.length}</span> users</span>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                {filteredUsers.length === users.length ? 'All Users' : 'Filtered Results'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </ModernDashboardLayout>
  );
}
