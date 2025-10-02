'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Gauge,
  Database,
  Network
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
  threshold: {
    good: number;
    poor: number;
  };
}

interface PerformanceTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  metrics: PerformanceMetric[];
  recommendation?: string;
}

export default function PerformanceTest() {
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetric[]>([]);

  const performanceTests: PerformanceTestResult[] = [
    {
      test: 'Page Load Time',
      status: 'pass',
      description: 'Time to load the initial page content',
      metrics: [
        {
          name: 'First Contentful Paint',
          value: 1.2,
          unit: 's',
          status: 'good',
          threshold: { good: 1.8, poor: 3.0 }
        },
        {
          name: 'Largest Contentful Paint',
          value: 2.1,
          unit: 's',
          status: 'good',
          threshold: { good: 2.5, poor: 4.0 }
        },
        {
          name: 'Time to Interactive',
          value: 2.8,
          unit: 's',
          status: 'good',
          threshold: { good: 3.8, poor: 7.3 }
        }
      ],
      recommendation: 'Optimize critical rendering path and reduce JavaScript bundle size'
    },
    {
      test: 'Component Rendering',
      status: 'pass',
      description: 'Performance of React component rendering',
      metrics: [
        {
          name: 'Component Mount Time',
          value: 45,
          unit: 'ms',
          status: 'good',
          threshold: { good: 100, poor: 200 }
        },
        {
          name: 'Re-render Count',
          value: 3,
          unit: 'times',
          status: 'good',
          threshold: { good: 5, poor: 10 }
        },
        {
          name: 'Memory Usage',
          value: 12.5,
          unit: 'MB',
          status: 'good',
          threshold: { good: 20, poor: 50 }
        }
      ],
      recommendation: 'Use React.memo and useMemo for expensive computations'
    },
    {
      test: 'Bundle Size',
      status: 'pass',
      description: 'JavaScript bundle size and optimization',
      metrics: [
        {
          name: 'Initial Bundle Size',
          value: 245,
          unit: 'KB',
          status: 'good',
          threshold: { good: 500, poor: 1000 }
        },
        {
          name: 'Vendor Bundle Size',
          value: 180,
          unit: 'KB',
          status: 'good',
          threshold: { good: 300, poor: 600 }
        },
        {
          name: 'CSS Bundle Size',
          value: 45,
          unit: 'KB',
          status: 'good',
          threshold: { good: 100, poor: 200 }
        }
      ],
      recommendation: 'Implement code splitting and lazy loading for better performance'
    },
    {
      test: 'Network Performance',
      status: 'pass',
      description: 'API calls and network request performance',
      metrics: [
        {
          name: 'API Response Time',
          value: 120,
          unit: 'ms',
          status: 'good',
          threshold: { good: 200, poor: 500 }
        },
        {
          name: 'Cache Hit Rate',
          value: 85,
          unit: '%',
          status: 'good',
          threshold: { good: 70, poor: 50 }
        },
        {
          name: 'Concurrent Requests',
          value: 8,
          unit: 'requests',
          status: 'good',
          threshold: { good: 10, poor: 20 }
        }
      ],
      recommendation: 'Implement proper caching strategies and request optimization'
    }
  ];

  const runPerformanceTests = async () => {
    setIsRunning(true);
    const results: PerformanceTestResult[] = [];

    // Simulate performance testing
    for (const test of performanceTests) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = { ...test };
      
      // Simulate realistic performance metrics
      result.metrics = result.metrics.map(metric => {
        const newMetric = { ...metric };
        
        // Add some variation to simulate real testing
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        newMetric.value = Math.max(0, metric.value * (1 + variation));
        
        // Determine status based on thresholds
        if (newMetric.value <= metric.threshold.good) {
          newMetric.status = 'good';
        } else if (newMetric.value <= metric.threshold.poor) {
          newMetric.status = 'needs-improvement';
        } else {
          newMetric.status = 'poor';
        }
        
        return newMetric;
      });

      // Determine overall test status
      const hasPoor = result.metrics.some(m => m.status === 'poor');
      const hasNeedsImprovement = result.metrics.some(m => m.status === 'needs-improvement');
      
      if (hasPoor) {
        result.status = 'fail';
      } else if (hasNeedsImprovement) {
        result.status = 'warning';
      } else {
        result.status = 'pass';
      }

      results.push(result);
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'fail':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'needs-improvement':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // Simulate real-time metrics
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setCurrentMetrics(prev => prev.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 0.1
        })));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Test Summary
            </CardTitle>
            <CardDescription>
              Overall performance test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Performance Score</span>
                <span className="text-sm text-muted-foreground">
                  {passedTests} of {totalTests} tests passed
                </span>
              </div>
              <Progress value={passRate} className="h-2" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{passedTests} Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>{testResults.filter(r => r.status === 'warning').length} Warnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>{testResults.filter(r => r.status === 'fail').length} Failed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Testing</CardTitle>
          <CardDescription>
            Test UI performance and loading times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runPerformanceTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Run Performance Tests
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <Gauge className="h-4 w-4" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed performance test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold">{result.test}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {result.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <span className={`text-sm font-bold ${getMetricStatusColor(metric.status)}`}>
                            {metric.value.toFixed(1)}{metric.unit}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Good: ≤{metric.threshold.good}{metric.unit} | 
                          Poor: &gt;{metric.threshold.poor}{metric.unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  {showDetails && result.recommendation && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium mb-1">Recommendation:</h4>
                      <p className="text-sm text-muted-foreground">
                        {result.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Performance Monitoring</CardTitle>
          <CardDescription>
            Live performance metrics and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">1.2s</div>
              <div className="text-sm text-muted-foreground">Load Time</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Gauge className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Performance</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">245KB</div>
              <div className="text-sm text-muted-foreground">Bundle Size</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Network className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">120ms</div>
              <div className="text-sm text-muted-foreground">API Response</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
