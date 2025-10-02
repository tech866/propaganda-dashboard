import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { 
  Monitor, 
  Accessibility, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  TestTube
} from 'lucide-react';

export default function TestingDashboard() {
  const testSuites = [
    {
      title: 'Responsive Design Testing',
      description: 'Test UI responsiveness across different devices and screen sizes',
      icon: Monitor,
      href: '/testing/responsive',
      status: 'ready',
      features: [
        'Mobile device testing',
        'Tablet compatibility',
        'Desktop optimization',
        'Breakpoint validation'
      ]
    },
    {
      title: 'Accessibility Testing',
      description: 'Test WCAG AA compliance and accessibility features',
      icon: Accessibility,
      href: '/testing/accessibility',
      status: 'ready',
      features: [
        'Keyboard navigation',
        'Screen reader support',
        'Color contrast testing',
        'Focus indicators'
      ]
    },
    {
      title: 'Performance Testing',
      description: 'Test UI performance and loading times',
      icon: Zap,
      href: '/testing/performance',
      status: 'ready',
      features: [
        'Page load metrics',
        'Component rendering',
        'Bundle size analysis',
        'Network performance'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'running':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testing Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing suite for UI quality assurance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Test Suites</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TestTube className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Test Cases</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Issues Found</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Suites */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {testSuites.map((suite, index) => {
            const Icon = suite.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{suite.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {suite.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(suite.status)}>
                      {suite.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {suite.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={suite.href} className="flex items-center gap-2">
                      Run Tests
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testing Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Guidelines</CardTitle>
            <CardDescription>
              Best practices for comprehensive UI testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Responsive Testing</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Test on multiple device sizes</li>
                  <li>• Verify touch targets are accessible</li>
                  <li>• Check horizontal scrolling behavior</li>
                  <li>• Validate breakpoint transitions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Accessibility Testing</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use keyboard navigation only</li>
                  <li>• Test with screen readers</li>
                  <li>• Verify color contrast ratios</li>
                  <li>• Check focus indicators</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Performance Testing</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Measure Core Web Vitals</li>
                  <li>• Test on slow connections</li>
                  <li>• Monitor memory usage</li>
                  <li>• Validate bundle sizes</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Cross-Browser Testing</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Test on Chrome, Firefox, Safari</li>
                  <li>• Verify Edge compatibility</li>
                  <li>• Check mobile browsers</li>
                  <li>• Validate feature support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernDashboardLayout>
  );
}
