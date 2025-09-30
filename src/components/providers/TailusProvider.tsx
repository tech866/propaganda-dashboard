'use client';

import React, { ReactNode } from 'react';
import { palette } from '@tailus/themer';

// Tailus provider wrapper component
export function TailusProvider({ children }: { children: ReactNode }) {
  // Apply Tailus theming
  React.useEffect(() => {
    // Apply the dark theme palette
    const darkPalette = palette('dark');
    
    // Apply CSS custom properties for Tailus theming
    const root = document.documentElement;
    
    // Apply color palette
    Object.entries(darkPalette).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--${key}`, value);
      }
    });
  }, []);

  return <>{children}</>;
}
