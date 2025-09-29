import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormContainer({
  title,
  subtitle,
  children,
  className = ''
}: FormContainerProps) {
  return (
    <Card className={cn("w-full", className)}>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle className="text-h2">{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-card">
        {children}
      </CardContent>
    </Card>
  );
}
