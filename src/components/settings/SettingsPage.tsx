'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Plug, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock data for development
  const mockUserProfile = {
    id: 'dev-user-1',
    name: 'Development User',
    email: 'dev@example.com',
    avatar_url: null,
    phone: '+1-555-0123',
    timezone: 'America/New_York',
    language: 'en',
    date_format: 'MM/DD/YYYY',
    currency: 'USD'
  };

  const mockUserPreferences = {
    id: 'dev-user-1',
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard_layout: 'default',
    items_per_page: 25,
    auto_refresh: true,
    refresh_interval: 30
  };

  const mockNotificationSettings = {
    id: 'dev-user-1',
    call_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    weekly_reports: true,
    monthly_reports: true,
    system_alerts: true,
    marketing_updates: false
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4">
            <Settings className="h-10 w-10 text-purple-400" />
            Settings
          </h1>
          <p className="text-gray-400 text-lg">Manage your account preferences and system configuration</p>
          {success && (
            <Badge variant="default" className="mt-4 text-base px-4 py-2 flex items-center gap-2 bg-green-600">
              <CheckCircle className="h-5 w-5" />
              {success}
            </Badge>
          )}
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
                <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  System
                </TabsTrigger>
                <TabsTrigger value="integrations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Plug className="h-4 w-4 mr-2" />
                  Integrations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                      <User className="h-6 w-6 text-blue-400" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Update your personal details and contact information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-gray-300">Full Name</label>
                        <input 
                          type="text" 
                          value={mockUserProfile.name}
                          className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-300">Email Address</label>
                        <input 
                          type="email" 
                          value={mockUserProfile.email}
                          className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-300">Phone Number</label>
                        <input 
                          type="tel" 
                          value={mockUserProfile.phone}
                          className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-300">Timezone</label>
                        <input 
                          type="text" 
                          value={mockUserProfile.timezone}
                          className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary"
                          readOnly
                        />
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                      onClick={() => setSuccess('Profile updated successfully!')}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                      <Bell className="h-6 w-6 text-green-400" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Configure how you receive notifications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Email Notifications</label>
                        <input type="checkbox" checked={mockNotificationSettings.email_notifications} className="w-4 h-4" readOnly />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">SMS Notifications</label>
                        <input type="checkbox" checked={mockNotificationSettings.sms_notifications} className="w-4 h-4" readOnly />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Weekly Reports</label>
                        <input type="checkbox" checked={mockNotificationSettings.weekly_reports} className="w-4 h-4" readOnly />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Monthly Reports</label>
                        <input type="checkbox" checked={mockNotificationSettings.monthly_reports} className="w-4 h-4" readOnly />
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                      onClick={() => setSuccess('Notification settings updated successfully!')}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Notifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="mt-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                      <Shield className="h-6 w-6 text-yellow-400" />
                      System Configuration
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      System-wide settings and configurations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-gray-300">Theme</label>
                        <select className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary">
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-300">Language</label>
                        <select className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                      onClick={() => setSuccess('System settings updated successfully!')}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save System Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations" className="mt-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                      <Plug className="h-6 w-6 text-purple-400" />
                      Integrations
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-base">
                      Manage third-party integrations and API connections.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Meta Marketing API</h3>
                          <p className="text-gray-400 text-sm">Facebook and Instagram advertising integration</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Configure
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Supabase Database</h3>
                          <p className="text-gray-400 text-sm">Cloud database and authentication</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Configure
                        </Button>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                      onClick={() => setSuccess('Integration settings updated successfully!')}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Integration Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}