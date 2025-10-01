'use client';

import React, { ReactNode } from 'react';

// Tailus provider wrapper component
export function TailusProvider({ children }: { children: ReactNode }) {
  // Apply Tailus theming - only add Tailus-specific classes
  React.useEffect(() => {
    // Add Tailus-specific classes to the document
    document.documentElement.classList.add('tailus-theme');
    
    // Apply any Tailus-specific CSS variables that don't conflict with our theme
    const root = document.documentElement;
    
    // Only set Tailus-specific variables that aren't already defined in globals.css
    root.style.setProperty('--tailus-radius', '0.75rem');
    root.style.setProperty('--tailus-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
  }, []);

  return <>{children}</>;
}
