'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Call {
  id: string;
  prospect_name: string;
  prospect_email?: string;
  call_type: string;
  status: string;
  outcome: string;
  created_at: string;
  completed_at?: string;
}

export default function CallsPage() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/calls')
        .then(res => res.json())
        .then(data => {
          setCalls(data.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch calls:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading calls...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/30 text-green-400 border border-green-700/50';
      case 'no-show': return 'bg-red-900/30 text-red-400 border border-red-700/50';
      case 'rescheduled': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'won': return 'bg-green-900/30 text-green-400 border border-green-700/50';
      case 'lost': return 'bg-red-900/30 text-red-400 border border-red-700/50';
      case 'tbd': return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Call Logs</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                {user.publicMetadata?.role?.toString().toUpperCase() || 'USER'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.fullName || user.firstName}</span>
              <Link
                href="/calls/new"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                Log New Call
              </Link>
              <Link
                href="/calls/enhanced"
                className="bg-slate-700 hover:bg-slate-600 text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                Enhanced Call Logging
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground pb-3 px-1 text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/calls" className="text-primary border-b-2 border-primary pb-3 px-1 text-sm font-medium">
              Call Logs
            </Link>
            <Link href="/calls/new" className="text-muted-foreground hover:text-foreground pb-3 px-1 text-sm font-medium transition-colors">
              Log Call
            </Link>
            <Link href="/calls/enhanced" className="text-muted-foreground hover:text-foreground pb-3 px-1 text-sm font-medium transition-colors">
              Enhanced Logging
            </Link>
            <Link href="/analytics" className="text-muted-foreground hover:text-foreground pb-3 px-1 text-sm font-medium transition-colors">
              Analytics
            </Link>
            <Link href="/ad-spend" className="text-muted-foreground hover:text-foreground pb-3 px-1 text-sm font-medium transition-colors">
              Ad Spend
            </Link>
            {user.publicMetadata?.role === 'admin' && (
              <Link href="/admin/users/new" className="text-muted-foreground hover:text-foreground pb-3 px-1 text-sm font-medium transition-colors">
                Manage Users
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-xl rounded-2xl">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-foreground">
                All Calls ({calls.length})
              </h3>
            </div>

            {calls.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-foreground">No calls logged</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by logging your first call.</p>
                <div className="mt-6">
                  <Link
                    href="/calls/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    Log New Call
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden shadow-xl border border-slate-700 rounded-xl">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prospect
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Outcome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                    {calls.map((call) => (
                      <tr key={call.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{call.prospect_name}</div>
                          {call.prospect_email && (
                            <div className="text-sm text-muted-foreground">{call.prospect_email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50 capitalize">
                            {call.call_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                            {call.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(call.outcome)}`}>
                            {call.outcome.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(call.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
