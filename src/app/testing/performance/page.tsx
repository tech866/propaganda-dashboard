import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import PerformanceTest from '@/components/testing/PerformanceTest';

export default function PerformanceTestingPage() {
  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test UI performance and loading times
          </p>
        </div>
        
        <PerformanceTest />
      </div>
    </ModernDashboardLayout>
  );
}
