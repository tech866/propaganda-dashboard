import { Metadata } from 'next';
import IntegrationManagement from '@/components/integrations/IntegrationManagement';
import { MetaIntegration } from '@/components/integrations/MetaIntegration';
import { MetaClientWorkspace } from '@/components/integrations/MetaClientWorkspace';

export const metadata: Metadata = {
  title: 'Integrations | Propaganda Dashboard',
  description: 'Manage external service integrations and data synchronization',
};

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect and manage external services for your agency
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetaIntegration />
        <IntegrationManagement />
      </div>
      
      <MetaClientWorkspace />
    </div>
  );
}
