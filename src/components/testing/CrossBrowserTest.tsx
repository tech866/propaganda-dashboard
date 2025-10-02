'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Smartphone,
  Monitor
} from 'lucide-react';

interface BrowserTestResult {
  browser: string;
  version: string;
  status: 'pass' | 'fail' | 'warning';
  features: {
    name: string;
    status: 'supported' | 'partial' | 'unsupported';
    notes?: string;
  }[];
  issues: string[];
  recommendations: string[];
}

export default function CrossBrowserTest() {
  const [testResults, setTestResults] = useState<BrowserTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentBrowser, setCurrentBrowser] = useState('');

  const browsers = [
    {
      name: 'Chrome',
      icon: Chrome,
      versions: ['120', '119', '118'],
      color: 'text-green-500'
    },
    {
      name: 'Firefox',
      icon: Firefox,
      versions: ['121', '120', '119'],
      color: 'text-orange-500'
    },
    {
      name: 'Safari',
      icon: Safari,
      versions: ['17', '16', '15'],
      color: 'text-blue-500'
    },
    {
      name: 'Edge',
      icon: Edge,
      versions: ['120', '119', '118'],
      color: 'text-blue-600'
    }
  ];

  const features = [
    'CSS Grid',
    'CSS Flexbox',
    'CSS Custom Properties',
    'CSS Backdrop Filter',
    'CSS Container Queries',
    'JavaScript ES6+',
    'Web Components',
    'Intersection Observer',
    'Resize Observer',
    'Web Animations API',
    'CSS Scroll Snap',
    'CSS Logical Properties'
  ];

  const runCrossBrowserTests = async () => {
    setIsRunning(true);
    const results: BrowserTestResult[] = [];

    for (const browser of browsers) {
      setCurrentBrowser(browser.name);
      
      const result: BrowserTestResult = {
        browser: browser.name,
        version: browser.versions[0],
        status: 'pass',
        features: [],
        issues: [],
        recommendations: []
      };

      // Simulate feature testing for each browser
      for (const feature of features) {
        await new Promise(resolve => setTimeout(resolve, 50));
        
        let status: 'supported' | 'partial' | 'unsupported' = 'supported';
        let notes = '';

        // Simulate browser-specific feature support
        if (browser.name === 'Safari' && (feature.includes('CSS') || feature.includes('Web'))) {
          if (feature === 'CSS Backdrop Filter' || feature === 'CSS Container Queries') {
            status = 'partial';
            notes = 'Limited support in older versions';
          }
        } else if (browser.name === 'Firefox' && feature === 'CSS Container Queries') {
          status = 'partial';
          notes = 'Experimental support';
        } else if (browser.name === 'Edge' && feature === 'Web Components') {
          status = 'partial';
          notes = 'Polyfill required for older versions';
        }

        result.features.push({
          name: feature,
          status,
          notes
        });
      }

      // Check for issues
      const unsupportedFeatures = result.features.filter(f => f.status === 'unsupported');
      const partialFeatures = result.features.filter(f => f.status === 'partial');

      if (unsupportedFeatures.length > 0) {
        result.status = 'fail';
        result.issues.push(`${unsupportedFeatures.length} features not supported`);
      } else if (partialFeatures.length > 0) {
        result.status = 'warning';
        result.issues.push(`${partialFeatures.length} features have limited support`);
      }

      // Add recommendations
      if (browser.name === 'Safari') {
        result.recommendations.push('Consider fallbacks for CSS features');
        result.recommendations.push('Test on iOS Safari for mobile compatibility');
      } else if (browser.name === 'Firefox') {
        result.recommendations.push('Enable experimental features for testing');
        result.recommendations.push('Check for CSS prefix requirements');
      } else if (browser.name === 'Edge') {
        result.recommendations.push('Test on both Chromium and legacy Edge');
        result.recommendations.push('Consider polyfills for older versions');
      }

      results.push(result);
    }

    setTestResults(results);
    setIsRunning(false);
    setCurrentBrowser('');
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

  const getFeatureStatusColor = (status: string) => {
    switch (status) {
      case 'supported':
        return 'text-green-500';
      case 'partial':
        return 'text-yellow-500';
      case 'unsupported':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Test Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Cross-Browser Test Summary
            </CardTitle>
            <CardDescription>
              Browser compatibility test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Browser Compatibility</span>
                <span className="text-sm text-muted-foreground">
                  {passedTests} of {totalTests} browsers passed
                </span>
              </div>
              <Progress value={passRate} className="h-2" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{passedTests} Compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>{testResults.filter(r => r.status === 'warning').length} Warnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>{testResults.filter(r => r.status === 'fail').length} Issues</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Browser Testing</CardTitle>
          <CardDescription>
            Test UI compatibility across different browsers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runCrossBrowserTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing {currentBrowser}...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Run Cross-Browser Tests
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Browser Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Browsers</CardTitle>
          <CardDescription>
            Modern browsers with comprehensive feature support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {browsers.map((browser, index) => {
              const Icon = browser.icon;
              return (
                <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${browser.color}`} />
                  <div className="text-sm font-medium">{browser.name}</div>
                  <div className="text-xs text-muted-foreground">
                    v{browser.versions[0]}+
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed browser compatibility test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {testResults.map((result, index) => {
                const browser = browsers.find(b => b.name === result.browser);
                const Icon = browser?.icon || Globe;
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 ${browser?.color || 'text-gray-500'}`} />
                        <div>
                          <h3 className="font-semibold">{result.browser}</h3>
                          <p className="text-sm text-muted-foreground">
                            Version {result.version}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Feature Support */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Feature Support:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {result.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              feature.status === 'supported' ? 'bg-green-500' :
                              feature.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className={getFeatureStatusColor(feature.status)}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showDetails && (
                      <div className="space-y-3">
                        {result.issues.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-destructive mb-1">Issues:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {result.issues.map((issue, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.recommendations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-blue-500 mb-1">Recommendations:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Feature Details */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Feature Details:</h4>
                          <div className="space-y-2">
                            {result.features.filter(f => f.notes).map((feature, i) => (
                              <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                <span className="font-medium">{feature.name}:</span>
                                <span className="text-muted-foreground ml-2">{feature.notes}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browser Testing Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Testing Guidelines</CardTitle>
          <CardDescription>
            Best practices for cross-browser compatibility testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Desktop Browsers</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chrome (latest 2 versions)</li>
                <li>• Firefox (latest 2 versions)</li>
                <li>• Safari (latest 2 versions)</li>
                <li>• Edge (latest 2 versions)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Mobile Browsers</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chrome Mobile (Android)</li>
                <li>• Safari Mobile (iOS)</li>
                <li>• Samsung Internet</li>
                <li>• Firefox Mobile</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Testing Checklist</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Visual consistency across browsers</li>
                <li>• JavaScript functionality</li>
                <li>• CSS feature support</li>
                <li>• Performance differences</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Common Issues</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSS prefix requirements</li>
                <li>• JavaScript API differences</li>
                <li>• Font rendering variations</li>
                <li>• Scroll behavior differences</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
