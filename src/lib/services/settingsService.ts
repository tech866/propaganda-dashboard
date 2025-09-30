// Settings service for user preferences and system configuration
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    system: boolean;
    security: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'detailed' | 'minimal';
    refreshInterval: number; // in seconds
    showCharts: boolean;
    showKPIs: boolean;
    showRecentActivity: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'team';
    dataSharing: boolean;
    analytics: boolean;
  };
  accessibility: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: string;
  agency_id: string;
  general: {
    companyName: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    language: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    defaultNotificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number; // in minutes
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  integrations: {
    allowedProviders: string[];
    webhookUrl?: string;
    apiKey?: string;
  };
  billing: {
    billingCycle: 'monthly' | 'quarterly' | 'annually';
    paymentMethod: string;
    billingEmail: string;
    taxId?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: {
      calls: boolean;
      campaigns: boolean;
      financial: boolean;
      system: boolean;
      security: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      calls: boolean;
      campaigns: boolean;
      financial: boolean;
      system: boolean;
      security: boolean;
    };
  };
  sms: {
    enabled: boolean;
    phoneNumber?: string;
    types: {
      calls: boolean;
      campaigns: boolean;
      financial: boolean;
      system: boolean;
      security: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export class SettingsService {
  private agencyId: string;
  private userId: string;

  constructor(agencyId: string, userId: string) {
    this.agencyId = agencyId;
    this.userId = userId;
  }

  // User Profile Management
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      return this.getMockUserProfile();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // In a real implementation, this would update the database
      // For now, return mock data
      const currentProfile = await this.getUserProfile();
      return {
        ...currentProfile!,
        ...profileData,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // User Preferences Management
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      return this.getMockUserPreferences();
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(preferencesData: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      // In a real implementation, this would update the database
      // For now, return mock data
      const currentPreferences = await this.getUserPreferences();
      return {
        ...currentPreferences!,
        ...preferencesData,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // System Settings Management (Admin/CEO only)
  async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      return this.getMockSystemSettings();
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return null;
    }
  }

  async updateSystemSettings(settingsData: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      // In a real implementation, this would update the database
      // For now, return mock data
      const currentSettings = await this.getSystemSettings();
      return {
        ...currentSettings!,
        ...settingsData,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // Notification Settings Management
  async getNotificationSettings(): Promise<NotificationSettings | null> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      return this.getMockNotificationSettings();
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
  }

  async updateNotificationSettings(settingsData: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      // In a real implementation, this would update the database
      // For now, return mock data
      const currentSettings = await this.getNotificationSettings();
      return {
        ...currentSettings!,
        ...settingsData,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Mock data methods for development
  private getMockUserProfile(): UserProfile {
    return {
      id: this.userId,
      email: 'user@example.com',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      phone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-09-30T00:00:00Z'
    };
  }

  private getMockUserPreferences(): UserPreferences {
    return {
      id: 'pref-1',
      user_id: this.userId,
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        system: true,
        security: true
      },
      dashboard: {
        defaultView: 'overview',
        refreshInterval: 30,
        showCharts: true,
        showKPIs: true,
        showRecentActivity: true
      },
      privacy: {
        profileVisibility: 'team',
        dataSharing: true,
        analytics: true
      },
      accessibility: {
        theme: 'dark',
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false
      },
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-09-30T00:00:00Z'
    };
  }

  private getMockSystemSettings(): SystemSettings {
    return {
      id: 'sys-1',
      agency_id: this.agencyId,
      general: {
        companyName: 'Propaganda Agency',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        language: 'en'
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        defaultNotificationSettings: {
          email: true,
          push: true,
          sms: false
        }
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        sessionTimeout: 480, // 8 hours
        twoFactorRequired: false,
        ipWhitelist: []
      },
      integrations: {
        allowedProviders: ['google', 'facebook', 'meta', 'tiktok', 'linkedin'],
        webhookUrl: 'https://api.propaganda.com/webhooks',
        apiKey: 'sk-***'
      },
      billing: {
        billingCycle: 'monthly',
        paymentMethod: 'Credit Card',
        billingEmail: 'billing@propaganda.com',
        taxId: '12-3456789'
      },
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-09-30T00:00:00Z'
    };
  }

  private getMockNotificationSettings(): NotificationSettings {
    return {
      id: 'notif-1',
      user_id: this.userId,
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          calls: true,
          campaigns: true,
          financial: false,
          system: true,
          security: true
        }
      },
      push: {
        enabled: true,
        types: {
          calls: true,
          campaigns: false,
          financial: false,
          system: true,
          security: true
        }
      },
      sms: {
        enabled: false,
        phoneNumber: '+1 (555) 123-4567',
        types: {
          calls: false,
          campaigns: false,
          financial: false,
          system: false,
          security: true
        }
      },
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-09-30T00:00:00Z'
    };
  }
}

// Helper functions for formatting
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export const getTimezoneOptions = () => {
  return [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
  ];
};

export const getLanguageOptions = () => {
  return [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' }
  ];
};

export const getCurrencyOptions = () => {
  return [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'BRL', label: 'Brazilian Real (R$)' },
    { value: 'MXN', label: 'Mexican Peso ($)' }
  ];
};

export const getDateFormatOptions = () => {
  return [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY' }
  ];
};
