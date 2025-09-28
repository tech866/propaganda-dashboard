'use client';

import React, { useEffect, useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { ProtectedComponent } from '@/components/auth/ProtectedComponent';
import { Call } from '@/lib/services/callService';

interface ProtectedCallLogTableProps {
  className?: string;
  showAllData?: boolean; // If true, shows all data regardless of role
}

function CallLogTableContent({ className = '', showAllData = false }: ProtectedCallLogTableProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, hasAnyRole } = useRole();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which calls endpoint to call based on user role
        let endpoint = '/api/calls';
        if (showAllData || hasAnyRole(['admin', 'ceo'])) {
          // Admin and CEO can see all calls
          endpoint = '/api/calls?includeAll=true';
        } else if (user?.role === 'sales') {
          // Sales users only see their own calls
          endpoint = `/api/calls?userId=${user.id}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch calls: ${response.status}`);
        }
        
        const data = await response.json();
        setCalls(data.data || []);
      } catch (err) {
        console.error('Failed to fetch calls:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch calls');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [user, hasAnyRole, showAllData]);

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Logs Unavailable</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!calls || calls.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Call Logs</h3>
          <p className="text-gray-600">No call logs available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md overflow-x-auto ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Call Logs</h3>
        <div className="text-sm text-gray-500">
          {hasAnyRole(['admin', 'ceo']) ? 'All Calls' : 'Your Calls'}
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prospect Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Outcome
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration (min)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scheduled At
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed At
            </th>
            {hasAnyRole(['admin', 'ceo']) && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {calls.map((call) => (
            <tr key={call.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {call.prospect_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  call.call_type === 'inbound' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {call.call_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  call.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : call.status === 'no-show'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {call.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  call.outcome === 'won' 
                    ? 'bg-green-100 text-green-800' 
                    : call.outcome === 'lost'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {call.outcome}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {call.call_duration ?? 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {call.scheduled_at ? new Date(call.scheduled_at).toLocaleString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {call.completed_at ? new Date(call.completed_at).toLocaleString() : 'N/A'}
              </td>
              {hasAnyRole(['admin', 'ceo']) && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {call.user_id}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProtectedCallLogTable(props: ProtectedCallLogTableProps) {
  return (
    <ProtectedComponent
      requiredPermissions={['view_own_calls']}
      showAccessDenied={true}
    >
      <CallLogTableContent {...props} />
    </ProtectedComponent>
  );
}
