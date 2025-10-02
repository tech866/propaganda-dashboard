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
      allowedRoles={['sales', 'admin', 'ceo']}
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Access Restricted</h2>
            <p className="text-gray-400 mb-4">
              You don&apos;t have permission to view performance analytics.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </div>
      }
    >
      <PerformancePage />
    </RoleBasedAccess>
  );
}