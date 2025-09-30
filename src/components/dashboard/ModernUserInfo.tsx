'use client';

// import { useUser } from '@clerk/nextjs'; // Temporarily disabled for development
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, Building } from 'lucide-react';

interface ModernUserInfoProps {
  className?: string;
}

export default function ModernUserInfo({ className = '' }: ModernUserInfoProps) {
  const { user: roleUser } = useRole();

  if (!roleUser) return null;

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'ceo':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sales':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'agency_user':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'client_user':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Account Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={''} alt={roleUser.name || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-semibold">
              {getInitials(roleUser.name || '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {roleUser.name || 'User'}
            </h3>
            <Badge 
              variant="outline" 
              className={`${getRoleColor(roleUser?.role)} font-medium`}
            >
              {roleUser?.role?.toUpperCase() || 'USER'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Detailed Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Mail className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{roleUser.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-sm text-gray-900 capitalize">{roleUser?.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Agency ID</p>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                {roleUser?.clientId || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Account Status</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
