import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationIndicatorProps {
  isValid?: boolean;
  hasError?: boolean;
  isTouched?: boolean;
  errorMessage?: string;
  className?: string;
}

export default function ValidationIndicator({
  isValid,
  hasError,
  isTouched,
  errorMessage,
  className
}: ValidationIndicatorProps) {
  if (!isTouched) {
    return null;
  }

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-top-1 duration-200", 
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <XCircle className="h-4 w-4 flex-shrink-0 animate-pulse" aria-hidden="true" />
        <span className="font-medium">{errorMessage}</span>
      </div>
    );
  }

  if (isValid) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 text-green-400 text-sm animate-in slide-in-from-top-1 duration-200", 
          className
        )}
        role="status"
        aria-live="polite"
      >
        <CheckCircle className="h-4 w-4 flex-shrink-0 animate-in zoom-in-50 duration-200" aria-hidden="true" />
        <span className="font-medium">Valid</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-amber-400 text-sm animate-in slide-in-from-top-1 duration-200", 
        className
      )}
      role="status"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0 animate-spin" aria-hidden="true" />
      <span className="font-medium">Validating...</span>
    </div>
  );
}
