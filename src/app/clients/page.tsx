import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';

export const metadata: Metadata = {
  title: 'Client Management | Propaganda Dashboard',
  description: 'Manage client accounts, view performance, and configure client settings',
};

export default function Clients() {
  return (
    <RoleBasedAccess 
      allowedRoles={['admin', 'ceo']}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view client management.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">Manage client accounts and view performance</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Page with RoleBasedAccess</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a test page with RoleBasedAccess to isolate the error.</p>
          </CardContent>
        </Card>
      </div>
    </RoleBasedAccess>
  );
}