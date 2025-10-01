'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Mock user interface
interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  emailAddresses: Array<{ emailAddress: string }>;
  publicMetadata: {
    role?: string;
    agency_id?: string;
  };
}

// Mock auth context
interface MockAuthContextType {
  user: MockUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const MockAuthContext = createContext<MockAuthContextType>({
  user: null,
  isLoaded: false,
  isSignedIn: false,
});

// Mock user data
const mockUser: MockUser = {
  id: 'mock-user-1',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  publicMetadata: {
    role: 'admin',
    agency_id: 'mock-agency-1',
  },
};

// Mock auth provider component
export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded] = React.useState(true);
  const [user] = React.useState<MockUser | null>(mockUser);
  const [isSignedIn] = React.useState(true);

  const value: MockAuthContextType = {
    user,
    isLoaded,
    isSignedIn,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Mock useUser hook
export function useMockUser() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockUser must be used within a MockAuthProvider');
  }
  return context;
}

