import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import AccessibilityTest from '@/components/testing/AccessibilityTest';

export default function AccessibilityTestingPage() {
  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accessibility Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test WCAG AA compliance and accessibility features
          </p>
        </div>
        
        <AccessibilityTest />
      </div>
    </ModernDashboardLayout>
  );
}
