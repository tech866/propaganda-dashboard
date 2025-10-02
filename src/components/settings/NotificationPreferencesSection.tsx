'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/25 mx-auto mb-4">
            <Bell className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Notifications */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-500/50 px-3 py-1 text-sm font-medium">
                Email Notifications
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-400" />
              Email Notifications
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
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
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <Badge variant="outline" className="bg-green-600/20 text-green-300 border-green-500/50 px-3 py-1 text-sm font-medium">
                Push Notifications
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-green-400" />
              Push Notifications
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
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
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <Badge variant="outline" className="bg-orange-600/20 text-orange-300 border-orange-500/50 px-3 py-1 text-sm font-medium">
                SMS Notifications
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-orange-400" />
              SMS Notifications
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
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
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
