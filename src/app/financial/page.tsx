'use client';

import { useEffect, useState } from 'react';
// import { useUser } from '@clerk/nextjs'; // Temporarily disabled for development
import { useRouter } from 'next/navigation';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { useAgency } from '@/contexts/AgencyContext';
import { FinancialManagement } from '@/components/financial/FinancialManagement';
import { FinancialReports } from '@/components/financial/FinancialReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';

export default function FinancialPage() {
  const { user: roleUser, canViewFinancialData, isLoading: userLoading } = useRole();
  const { agency, isLoading: agencyLoading } = useAgency();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('management');

  // Development mode - bypass authentication
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
    // Mock user is already set in RoleContext
  }

  if (userLoading || agencyLoading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (!roleUser) {
    return null;
  }

  if (!agency) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No agency data available</p>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  // Check if user has financial access
  if (!canViewFinancialData) {
    return (
      <ModernDashboardLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Records</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Manage and track all financial transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {roleUser?.role?.toUpperCase() || 'USER'}
              </Badge>
            </div>
          </div>

          {/* Access Denied Card */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Shield className="h-5 w-5" />
                Access Restricted
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Financial data access is limited to authorized users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Limited Access</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your current role ({roleUser?.role?.toUpperCase()}) does not have permission to view financial data. 
                    Contact your administrator to request access to financial records and analytics.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-medium text-yellow-800">Financial Data</h3>
                    <p className="text-sm text-yellow-700">Revenue, expenses, and profit tracking</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-medium text-yellow-800">Analytics</h3>
                    <p className="text-sm text-yellow-700">Performance metrics and insights</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-medium text-yellow-800">Reports</h3>
                    <p className="text-sm text-yellow-700">Detailed financial reports</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-sm text-yellow-700">
                  Need access? Contact your administrator or upgrade your account.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Records</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage and track all financial transactions for {agency.name}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {agency.subscription_plan.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Plan
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-sm">
              {roleUser?.role?.toUpperCase() || 'USER'}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <TrendingUp className="mr-1 h-3 w-3" />
              Financial Access
            </Badge>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financial Access</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Full</div>
              <p className="text-xs text-muted-foreground">
                Complete financial data access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Role</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {roleUser?.role?.toUpperCase() || 'USER'}
              </div>
              <p className="text-xs text-muted-foreground">
                Current permission level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agency Plan</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {agency.subscription_plan.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">
                Subscription tier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                System operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Management
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports & Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <FinancialManagement agencyId={agency.id} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <FinancialReports agencyId={agency.id} />
          </TabsContent>
        </Tabs>
      </div>
    </ModernDashboardLayout>
  );
}
