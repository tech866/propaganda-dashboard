'use client';

import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import MobileNavigation from './MobileNavigation';
import { cn } from '@/lib/utils';

interface ModernHeaderProps {
  className?: string;
}

export default function ModernHeader({ className = '' }: ModernHeaderProps) {
  const router = useRouter();
  const { user } = useRole();

  const handleSignOut = () => {
    // Development mode - redirect to home
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
      router.push('/');
      return;
    }
    // Production mode - would use Clerk signOut
  };

  if (!user) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  return (
    <header className={cn("header-modern", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Navigation Only - No duplicate branding */}
          <div className="flex items-center space-x-4">
            <MobileNavigation />
            <div className="hidden sm:flex items-center space-x-3">
              <Badge 
                variant={getRoleVariant(user?.publicMetadata?.role) as any}
                className="font-medium px-3 py-1"
              >
                {user?.publicMetadata?.role?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative hover-modern-subtle">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover-modern-subtle">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm font-medium">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 glass-premium" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge 
                      variant={getRoleVariant(user?.role) as any}
                      className="w-fit text-xs"
                    >
                      {user?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover-modern-subtle">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover-modern-subtle">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive hover-modern-subtle"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
