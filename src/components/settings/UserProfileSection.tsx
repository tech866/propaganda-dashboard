'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  DollarSign,
  Eye,
  EyeOff,
  Save,
  Upload,
  Camera
} from 'lucide-react';
import { 
  UserProfile, 
  UserPreferences,
  getTimezoneOptions,
  getLanguageOptions,
  getCurrencyOptions,
  getDateFormatOptions
} from '@/lib/services/settingsService';
import * as yup from 'yup';

interface UserProfileSectionProps {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  onSaveProfile: (data: Partial<UserProfile>) => Promise<void>;
  onSavePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  saving: boolean;
}

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string(),
  timezone: yup.string().required('Timezone is required'),
  language: yup.string().required('Language is required'),
  dateFormat: yup.string().required('Date format is required'),
  currency: yup.string().required('Currency is required')
});

export default function UserProfileSection({ 
  profile, 
  preferences, 
  onSaveProfile, 
  onSavePreferences, 
  saving 
}: UserProfileSectionProps) {
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [preferencesData, setPreferencesData] = useState<Partial<UserPreferences>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  React.useEffect(() => {
    if (preferences) {
      setPreferencesData(preferences);
    }
  }, [preferences]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPreferencesData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserPreferences],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = async () => {
    try {
      await profileSchema.validate(profileData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach(error => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await onSaveProfile(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSavePreferences(preferencesData);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (!profile || !preferences) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-lg">
                  {profileData.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Regional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone *</Label>
                <Select
                  value={profileData.timezone || ''}
                  onValueChange={(value) => handleInputChange('timezone', value)}
                >
                  <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTimezoneOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && <p className="text-sm text-red-500">{errors.timezone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Select
                  value={profileData.language || ''}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLanguageOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.language && <p className="text-sm text-red-500">{errors.language}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format *</Label>
                <Select
                  value={profileData.dateFormat || ''}
                  onValueChange={(value) => handleInputChange('dateFormat', value)}
                >
                  <SelectTrigger className={errors.dateFormat ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDateFormatOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dateFormat && <p className="text-sm text-red-500">{errors.dateFormat}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={profileData.currency || ''}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrencyOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && <p className="text-sm text-red-500">{errors.currency}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your dashboard and application preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePreferences} className="space-y-6">
            {/* Dashboard Preferences */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Dashboard</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultView">Default View</Label>
                  <Select
                    value={preferencesData.dashboard?.defaultView || 'overview'}
                    onValueChange={(value) => handleInputChange('dashboard.defaultView', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                  <Select
                    value={preferencesData.dashboard?.refreshInterval?.toString() || '30'}
                    onValueChange={(value) => handleInputChange('dashboard.refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select refresh interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Accessibility Preferences */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Accessibility</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferencesData.accessibility?.theme || 'dark'}
                    onValueChange={(value) => handleInputChange('accessibility.theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select
                    value={preferencesData.accessibility?.fontSize || 'medium'}
                    onValueChange={(value) => handleInputChange('accessibility.fontSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
