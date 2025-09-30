import { Metadata } from 'next';
import SettingsPage from '@/components/settings/SettingsPage';

export const metadata: Metadata = {
  title: 'Settings | Propaganda Dashboard',
  description: 'Manage your account preferences and system configuration',
};

export default function SettingsPageRoute() {
  return (
    <div className="container mx-auto py-6">
      <SettingsPage />
      </div>
  );
}