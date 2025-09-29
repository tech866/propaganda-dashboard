'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Phone, 
  Save,
  Eye,
  EyeOff,
  Key,
  Globe,
  Settings as SettingsIcon
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  clientId: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  systemAlerts: boolean;
}

interface SystemSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  theme: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    systemAlerts: true
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
    theme: 'dark'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with actual API calls
      const mockProfile: UserProfile = {
        id: session?.user?.id || '1',
        name: session?.user?.name || 'John Doe',
        email: session?.user?.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        role: session?.user?.role || 'sales',
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        isActive: true,
        createdAt: '2024-01-15',
        lastLogin: '2024-09-28'
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    // Implement save profile logic
    console.log('Saving profile:', profile);
  };

  const handleSaveNotifications = () => {
    // Implement save notifications logic
    console.log('Saving notifications:', notifications);
  };

  const handleSaveSystemSettings = () => {
    // Implement save system settings logic
    console.log('Saving system settings:', systemSettings);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ceo':
        return <Badge variant="default">CEO</Badge>;
      case 'admin':
        return <Badge variant="secondary">Admin</Badge>;
      case 'sales':
        return <Badge variant="success">Sales</Badge>;
      default:
        return <Badge variant="muted">{role}</Badge>;
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: SettingsIcon }
  ];

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-display">Settings</h1>
          <p className="text-body-lg text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-medium transition-colors rounded-xl ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-h3">Profile Information</CardTitle>
                  <p className="text-sm text-muted-foreground">Update your personal information and contact details</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-xl">
                        {profile?.name?.split(' ').map(n => n[0]).join('') || 'JD'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{profile?.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                      {profile?.role && getRoleBadge(profile.role)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <Input
                        value={profile?.name || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <Input
                        type="email"
                        value={profile?.email || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <Input
                        value={profile?.phone || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                      <Input
                        value={profile?.role || ''}
                        disabled
                        className="text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile}>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-h3">Notification Preferences</CardTitle>
                  <p className="text-sm text-muted-foreground">Configure how you receive notifications</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Email Notifications</h4>
                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">SMS Notifications</h4>
                        <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.smsNotifications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Push Notifications</h4>
                        <p className="text-xs text-muted-foreground">Receive push notifications in browser</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Weekly Reports</h4>
                        <p className="text-xs text-muted-foreground">Receive weekly performance reports</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReports}
                        onChange={(e) => setNotifications(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Monthly Reports</h4>
                        <p className="text-xs text-muted-foreground">Receive monthly performance reports</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.monthlyReports}
                        onChange={(e) => setNotifications(prev => ({ ...prev, monthlyReports: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">System Alerts</h4>
                        <p className="text-xs text-muted-foreground">Receive system alerts and updates</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.systemAlerts}
                        onChange={(e) => setNotifications(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications}>
                      <Save className="mr-2 h-4 w-4" /> Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-h3">Security Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage your account security and password</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Key className="mr-2 h-4 w-4" /> Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-h3">System Preferences</CardTitle>
                  <p className="text-sm text-muted-foreground">Configure system-wide settings and preferences</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                      <select
                        value={systemSettings.timezone}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
                        className="input-modern w-full"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Date Format</label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                        className="input-modern w-full"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                      <select
                        value={systemSettings.currency}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value }))}
                        className="input-modern w-full"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="input-modern w-full"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSystemSettings}>
                      <Save className="mr-2 h-4 w-4" /> Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  );
}
