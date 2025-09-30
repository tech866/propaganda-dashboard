import { Metadata } from 'next';
import { PerformancePage } from '@/components/performance/PerformancePage';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';

export const metadata: Metadata = {
  title: 'Performance Analytics | Propaganda Dashboard',
  description: 'Comprehensive performance metrics and analytics dashboard',
};

export default function Performance() {
  return (
    <RoleBasedAccess 
      allowedRoles={['admin', 'ceo']}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view performance analytics.
            </p>
          </div>
        </div>
      }
    >
      <PerformancePage />
    </RoleBasedAccess>
  );
}