'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Globe, 
  Bell, 
  CreditCard,
  Save,
  Building2,
  Clock,
  DollarSign,
  Calendar,
  Globe2,
  Lock,
  Key,
  Users,
  AlertTriangle
} from 'lucide-react';
import { 
  SystemSettings,
  getTimezoneOptions,
  getLanguageOptions,
  getCurrencyOptions,
  getDateFormatOptions
} from '@/lib/services/settingsService';

interface SystemConfigurationSectionProps {
  settings: SystemSettings | null;
  onSave: (data: Partial<SystemSettings>) => Promise<void>;
  saving: boolean;
}

export default function SystemConfigurationSection({ 
  settings, 
  onSave, 
  saving 
}: SystemConfigurationSectionProps) {
  const [settingsData, setSettingsData] = useState<Partial<SystemSettings>>({});

  React.useEffect(() => {
    if (settings) {
      setSettingsData(settings);
    }
  }, [settings]);

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setSettingsData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleToggle = (path: string, value: boolean) => {
    const keys = path.split('.');
    setSettingsData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSave(settingsData);
    } catch (error) {
      console.error('Error saving system settings:', error);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic system settings and company information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settingsData.general?.companyName || settings.general.companyName}
                  onChange={(e) => handleInputChange('general.companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select
                  value={settingsData.general?.timezone || settings.general.timezone}
                  onValueChange={(value) => handleInputChange('general.timezone', value)}
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settingsData.general?.currency || settings.general.currency}
                  onValueChange={(value) => handleInputChange('general.currency', value)}
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settingsData.general?.dateFormat || settings.general.dateFormat}
                  onValueChange={(value) => handleInputChange('general.dateFormat', value)}
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Select
                  value={settingsData.general?.language || settings.general.language}
                  onValueChange={(value) => handleInputChange('general.language', value)}
                >
                  <SelectTrigger>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailEnabled">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable email notifications
                  </p>
                </div>
                <Switch
                  id="emailEnabled"
                  checked={settingsData.notifications?.emailEnabled ?? settings.notifications.emailEnabled}
                  onCheckedChange={(checked) => handleToggle('notifications.emailEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsEnabled">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable SMS notifications
                  </p>
                </div>
                <Switch
                  id="smsEnabled"
                  checked={settingsData.notifications?.smsEnabled ?? settings.notifications.smsEnabled}
                  onCheckedChange={(checked) => handleToggle('notifications.smsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushEnabled">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable push notifications
                  </p>
                </div>
                <Switch
                  id="pushEnabled"
                  checked={settingsData.notifications?.pushEnabled ?? settings.notifications.pushEnabled}
                  onCheckedChange={(checked) => handleToggle('notifications.pushEnabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security policies and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Password Policy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={settingsData.security?.passwordPolicy?.minLength || settings.security.passwordPolicy.minLength}
                    onChange={(e) => handleInputChange('security.passwordPolicy.minLength', parseInt(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settingsData.security?.sessionTimeout || settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security.sessionTimeout', parseInt(e.target.value))}
                    min="15"
                    max="1440"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireUppercase">Require Uppercase</Label>
                    <p className="text-sm text-muted-foreground">
                      Password must contain uppercase letters
                    </p>
                  </div>
                  <Switch
                    id="requireUppercase"
                    checked={settingsData.security?.passwordPolicy?.requireUppercase ?? settings.security.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => handleToggle('security.passwordPolicy.requireUppercase', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireLowercase">Require Lowercase</Label>
                    <p className="text-sm text-muted-foreground">
                      Password must contain lowercase letters
                    </p>
                  </div>
                  <Switch
                    id="requireLowercase"
                    checked={settingsData.security?.passwordPolicy?.requireLowercase ?? settings.security.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => handleToggle('security.passwordPolicy.requireLowercase', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <p className="text-sm text-muted-foreground">
                      Password must contain numbers
                    </p>
                  </div>
                  <Switch
                    id="requireNumbers"
                    checked={settingsData.security?.passwordPolicy?.requireNumbers ?? settings.security.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => handleToggle('security.passwordPolicy.requireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <p className="text-sm text-muted-foreground">
                      Password must contain special characters
                    </p>
                  </div>
                  <Switch
                    id="requireSpecialChars"
                    checked={settingsData.security?.passwordPolicy?.requireSpecialChars ?? settings.security.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => handleToggle('security.passwordPolicy.requireSpecialChars', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorRequired">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Force all users to enable 2FA
                  </p>
                </div>
                <Switch
                  id="twoFactorRequired"
                  checked={settingsData.security?.twoFactorRequired ?? settings.security.twoFactorRequired}
                  onCheckedChange={(checked) => handleToggle('security.twoFactorRequired', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <Textarea
                  id="ipWhitelist"
                  value={settingsData.security?.ipWhitelist?.join('\n') || settings.security.ipWhitelist.join('\n')}
                  onChange={(e) => handleInputChange('security.ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
                  placeholder="Enter IP addresses, one per line"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to allow all IP addresses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Billing Settings
            </CardTitle>
            <CardDescription>
              Configure billing and payment settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select
                  value={settingsData.billing?.billingCycle || settings.billing.billingCycle}
                  onValueChange={(value) => handleInputChange('billing.billingCycle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  value={settingsData.billing?.paymentMethod || settings.billing.paymentMethod}
                  onChange={(e) => handleInputChange('billing.paymentMethod', e.target.value)}
                  placeholder="Credit Card, Bank Transfer, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={settingsData.billing?.billingEmail || settings.billing.billingEmail}
                  onChange={(e) => handleInputChange('billing.billingEmail', e.target.value)}
                  placeholder="billing@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={settingsData.billing?.taxId || settings.billing.taxId || ''}
                  onChange={(e) => handleInputChange('billing.taxId', e.target.value)}
                  placeholder="Tax identification number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save System Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
