import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import CrossBrowserTest from '@/components/testing/CrossBrowserTest';

export default function CrossBrowserTestingPage() {
  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cross-Browser Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test UI compatibility across different browsers and devices
          </p>
        </div>
        
        <CrossBrowserTest />
      </div>
    </ModernDashboardLayout>
  );
}
