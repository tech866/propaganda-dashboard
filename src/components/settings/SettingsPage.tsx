'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import { useAgency } from '@/contexts/AgencyContext';
import { useRole } from '@/contexts/RoleContext';
// import { useUser } from '@clerk/nextjs'; // Temporarily disabled for development
import { 
  SettingsService, 
  UserProfile, 
  UserPreferences, 
  SystemSettings, 
  NotificationSettings 
} from '@/lib/services/settingsService';
import { 
  AdminOnly, 
  CEOOnly 
} from '@/components/auth/RoleBasedAccess';
import UserProfileSection from './UserProfileSection';
import NotificationPreferencesSection from './NotificationPreferencesSection';
import SystemConfigurationSection from './SystemConfigurationSection';
import IntegrationSettingsSection from './IntegrationSettingsSection';

export default function SettingsPage() {
  const { agency } = useAgency();
  const { hasPermission } = useRole();
  const { user } = useRole(); // Use mocked user from RoleContext
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for different settings sections
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);

  const settingsService = agency && user ? new SettingsService(agency.id, user.id) : null;

  useEffect(() => {
    if (settingsService) {
      loadAllSettings();
    }
  }, [settingsService]);

  const loadAllSettings = async () => {
    if (!settingsService) return;

    try {
      setLoading(true);
      setError(null);

      const [profile, preferences, notifications] = await Promise.all([
        settingsService.getUserProfile(),
        settingsService.getUserPreferences(),
        settingsService.getNotificationSettings()
      ]);

      setUserProfile(profile);
      setUserPreferences(preferences);
      setNotificationSettings(notifications);

      // Load system settings only for admin/CEO users
      if (hasPermission('admin')) {
        const system = await settingsService.getSystemSettings();
        setSystemSettings(system);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    if (!settingsService) return;

    try {
      setSaving(true);
      setError(null);
      const updatedProfile = await settingsService.updateUserProfile(profileData);
      setUserProfile(updatedProfile);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (preferencesData: Partial<UserPreferences>) => {
    if (!settingsService) return;

    try {
      setSaving(true);
      setError(null);
      const updatedPreferences = await settingsService.updateUserPreferences(preferencesData);
      setUserPreferences(updatedPreferences);
      setSuccess('Preferences updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystemSettings = async (settingsData: Partial<SystemSettings>) => {
    if (!settingsService) return;

    try {
      setSaving(true);
      setError(null);
      const updatedSettings = await settingsService.updateSystemSettings(settingsData);
      setSystemSettings(updatedSettings);
      setSuccess('System settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving system settings:', err);
      setError('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async (settingsData: Partial<NotificationSettings>) => {
    if (!settingsService) return;

    try {
      setSaving(true);
      setError(null);
      const updatedSettings = await settingsService.updateNotificationSettings(settingsData);
      setNotificationSettings(updatedSettings);
      setSuccess('Notification settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAllSettings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and system configuration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {success && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
          <Button onClick={loadAllSettings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <AdminOnly>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </AdminOnly>
          <AdminOnly>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          </AdminOnly>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <UserProfileSection
            profile={userProfile}
            preferences={userPreferences}
            onSaveProfile={handleSaveProfile}
            onSavePreferences={handleSavePreferences}
            saving={saving}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationPreferencesSection
            settings={notificationSettings}
            onSave={handleSaveNotificationSettings}
            saving={saving}
          />
        </TabsContent>

        {/* System Tab - Admin Only */}
        <AdminOnly>
          <TabsContent value="system">
            <SystemConfigurationSection
              settings={systemSettings}
              onSave={handleSaveSystemSettings}
              saving={saving}
            />
          </TabsContent>
        </AdminOnly>

        {/* Integrations Tab - Admin Only */}
        <AdminOnly>
          <TabsContent value="integrations">
            <IntegrationSettingsSection
              settings={systemSettings}
              onSave={handleSaveSystemSettings}
              saving={saving}
            />
          </TabsContent>
        </AdminOnly>
      </Tabs>

      {/* Save Status */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving changes...</span>
          </div>
        </div>
      )}
    </div>
  );
}
