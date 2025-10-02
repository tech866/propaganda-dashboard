import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import ResponsiveDesignTest from '@/components/testing/ResponsiveDesignTest';

export default function ResponsiveTestingPage() {
  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Responsive Design Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test the UI responsiveness across different devices and screen sizes
          </p>
        </div>
        
        <ResponsiveDesignTest />
      </div>
    </ModernDashboardLayout>
  );
}
