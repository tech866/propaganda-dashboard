'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/contexts/RoleContext';
import { 
  Plus, 
  Phone, 
  Users, 
  Shield, 
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface ModernQuickActionsProps {
  className?: string;
}

export default function ModernQuickActions({ className = '' }: ModernQuickActionsProps) {
  const { canManageUsers, canViewAuditLogs, hasAnyRole } = useRole();

  const quickActions = [
    {
      title: 'Log New Call',
      description: 'Record a new sales call',
      href: '/calls/new',
      icon: Plus,
      color: 'bg-purple-600 hover:bg-purple-700',
      iconColor: 'text-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      title: 'View All Calls',
      description: 'Browse your call history',
      href: '/calls',
      icon: Phone,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      iconColor: 'text-gray-600',
      bgGradient: 'from-gray-50 to-gray-100'
    },
    {
      title: 'Add New User',
      description: 'Create a new user account',
      href: '/admin/users/new',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      requiredPermission: canManageUsers
    },
    {
      title: 'View Audit Logs',
      description: 'Monitor system activity',
      href: '/audit',
      icon: Shield,
      color: 'bg-green-600 hover:bg-green-700',
      iconColor: 'text-green-600',
      bgGradient: 'from-green-50 to-green-100',
      requiredPermission: canViewAuditLogs
    }
  ];

  const visibleActions = quickActions.filter(action => 
    !action.requiredPermission || action.requiredPermission
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Quick Actions</span>
          <Badge variant="secondary" className="text-xs">
            {visibleActions.length} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="ghost"
                  className={`
                    w-full h-auto p-4 flex flex-col items-start space-y-3 
                    hover:shadow-md transition-all duration-200
                    bg-gradient-to-br ${action.bgGradient}
                    border border-gray-200 hover:border-gray-300
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                        <Icon className={`h-5 w-5 ${action.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
