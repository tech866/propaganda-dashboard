import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import ValidationIndicator from './ValidationIndicator';

interface EnhancedFormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode; // For select options
  // Enhanced validation props
  isValid?: boolean;
  isTouched?: boolean;
  showValidationIndicator?: boolean;
  step?: string;
}

export default function EnhancedFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  children,
  isValid,
  isTouched,
  showValidationIndicator = true,
  step
}: EnhancedFormFieldProps) {
  const hasError = !!error;
  const showIndicator = showValidationIndicator && isTouched;

  const renderInput = () => {
    const baseInputClasses = cn(
      "input-modern transition-all duration-200 ease-in-out",
      "focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
      "hover:border-gray-400/50",
      hasError && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
      !hasError && isValid && isTouched && "border-green-500 focus:ring-green-500/50 focus:border-green-500",
      !hasError && !isValid && !isTouched && "focus:ring-blue-500/50 focus:border-blue-500",
      disabled && "opacity-50 cursor-not-allowed hover:border-gray-600/50"
    );

    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={4}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={cn(baseInputClasses, "min-h-[80px] resize-none")}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={cn(baseInputClasses, "cursor-pointer")}
        >
          {children}
        </select>
      );
    }

    return (
      <Input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        step={step}
        aria-describedby={hasError ? `${name}-error` : undefined}
        className={baseInputClasses}
      />
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={name} 
        className={cn(
          "text-foreground font-medium text-sm transition-colors duration-200",
          hasError && "text-red-400",
          !hasError && isValid && isTouched && "text-green-400"
        )}
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </Label>
      {renderInput()}
      
      {/* Validation Indicator */}
      {showIndicator && (
        <ValidationIndicator
          isValid={isValid}
          hasError={hasError}
          isTouched={isTouched}
          errorMessage={error}
        />
      )}
      
      {/* Error Message (fallback for non-indicator display) */}
      {!showIndicator && error && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-400 flex items-center gap-1" 
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
