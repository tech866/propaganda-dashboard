'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Save,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { NotificationSettings } from '@/lib/services/settingsService';

interface NotificationPreferencesSectionProps {
  settings: NotificationSettings | null;
  onSave: (data: Partial<NotificationSettings>) => Promise<void>;
  saving: boolean;
}

export default function NotificationPreferencesSection({ 
  settings, 
  onSave, 
  saving 
}: NotificationPreferencesSectionProps) {
  const [settingsData, setSettingsData] = useState<Partial<NotificationSettings>>({});

  React.useEffect(() => {
    if (settings) {
      setSettingsData(settings);
    }
  }, [settings]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSave(settingsData);
    } catch (error) {
      console.error('Error saving notification settings:', error);
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
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Configure your email notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={settingsData.email?.enabled ?? settings.email.enabled}
                onCheckedChange={(checked) => handleToggle('email.enabled', checked)}
              />
            </div>

            {settingsData.email?.enabled !== false && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-frequency">Email Frequency</Label>
                    <Select
                      value={settingsData.email?.frequency || settings.email.frequency}
                      onValueChange={(value) => handleInputChange('email.frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-calls">Call Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            New calls and call updates
                          </p>
                        </div>
                        <Switch
                          id="email-calls"
                          checked={settingsData.email?.types?.calls ?? settings.email.types.calls}
                          onCheckedChange={(checked) => handleToggle('email.types.calls', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-campaigns">Campaign Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Campaign status and performance
                          </p>
                        </div>
                        <Switch
                          id="email-campaigns"
                          checked={settingsData.email?.types?.campaigns ?? settings.email.types.campaigns}
                          onCheckedChange={(checked) => handleToggle('email.types.campaigns', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-financial">Financial Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Financial updates and reports
                          </p>
                        </div>
                        <Switch
                          id="email-financial"
                          checked={settingsData.email?.types?.financial ?? settings.email.types.financial}
                          onCheckedChange={(checked) => handleToggle('email.types.financial', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-system">System Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            System updates and maintenance
                          </p>
                        </div>
                        <Switch
                          id="email-system"
                          checked={settingsData.email?.types?.system ?? settings.email.types.system}
                          onCheckedChange={(checked) => handleToggle('email.types.system', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-security">Security Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Security alerts and login attempts
                          </p>
                        </div>
                        <Switch
                          id="email-security"
                          checked={settingsData.email?.types?.security ?? settings.email.types.security}
                          onCheckedChange={(checked) => handleToggle('email.types.security', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Configure your push notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
              <Switch
                id="push-enabled"
                checked={settingsData.push?.enabled ?? settings.push.enabled}
                onCheckedChange={(checked) => handleToggle('push.enabled', checked)}
              />
            </div>

            {settingsData.push?.enabled !== false && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-calls">Call Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          New calls and call updates
                        </p>
                      </div>
                      <Switch
                        id="push-calls"
                        checked={settingsData.push?.types?.calls ?? settings.push.types.calls}
                        onCheckedChange={(checked) => handleToggle('push.types.calls', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-campaigns">Campaign Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Campaign status and performance
                        </p>
                      </div>
                      <Switch
                        id="push-campaigns"
                        checked={settingsData.push?.types?.campaigns ?? settings.push.types.campaigns}
                        onCheckedChange={(checked) => handleToggle('push.types.campaigns', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-financial">Financial Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Financial updates and reports
                        </p>
                      </div>
                      <Switch
                        id="push-financial"
                        checked={settingsData.push?.types?.financial ?? settings.push.types.financial}
                        onCheckedChange={(checked) => handleToggle('push.types.financial', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-system">System Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          System updates and maintenance
                        </p>
                      </div>
                      <Switch
                        id="push-system"
                        checked={settingsData.push?.types?.system ?? settings.push.types.system}
                        onCheckedChange={(checked) => handleToggle('push.types.system', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-security">Security Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Security alerts and login attempts
                        </p>
                      </div>
                      <Switch
                        id="push-security"
                        checked={settingsData.push?.types?.security ?? settings.push.types.security}
                        onCheckedChange={(checked) => handleToggle('push.types.security', checked)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              Configure your SMS notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch
                id="sms-enabled"
                checked={settingsData.sms?.enabled ?? settings.sms.enabled}
                onCheckedChange={(checked) => handleToggle('sms.enabled', checked)}
              />
            </div>

            {settingsData.sms?.enabled !== false && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      type="tel"
                      value={settingsData.sms?.phoneNumber || settings.sms.phoneNumber || ''}
                      onChange={(e) => handleInputChange('sms.phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-calls">Call Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            New calls and call updates
                          </p>
                        </div>
                        <Switch
                          id="sms-calls"
                          checked={settingsData.sms?.types?.calls ?? settings.sms.types.calls}
                          onCheckedChange={(checked) => handleToggle('sms.types.calls', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-campaigns">Campaign Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Campaign status and performance
                          </p>
                        </div>
                        <Switch
                          id="sms-campaigns"
                          checked={settingsData.sms?.types?.campaigns ?? settings.sms.types.campaigns}
                          onCheckedChange={(checked) => handleToggle('sms.types.campaigns', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-financial">Financial Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Financial updates and reports
                          </p>
                        </div>
                        <Switch
                          id="sms-financial"
                          checked={settingsData.sms?.types?.financial ?? settings.sms.types.financial}
                          onCheckedChange={(checked) => handleToggle('sms.types.financial', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-system">System Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            System updates and maintenance
                          </p>
                        </div>
                        <Switch
                          id="sms-system"
                          checked={settingsData.sms?.types?.system ?? settings.sms.types.system}
                          onCheckedChange={(checked) => handleToggle('sms.types.system', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-security">Security Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Security alerts and login attempts
                          </p>
                        </div>
                        <Switch
                          id="sms-security"
                          checked={settingsData.sms?.types?.security ?? settings.sms.types.security}
                          onCheckedChange={(checked) => handleToggle('sms.types.security', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
