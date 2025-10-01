'use client';

import { useState } from 'react';

export default function EnhancedCallForm() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Enhanced Call Logging</h1>
          
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg">
            <p className="text-gray-600">Enhanced call logging form will be implemented here.</p>
            
            <button 
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => setLoading(!loading)}
            >
              {loading ? 'Loading...' : 'Test Button'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}