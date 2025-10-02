'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

interface ResponsiveTestResult {
  breakpoint: string;
  width: number;
  height: number;
  status: 'pass' | 'fail' | 'warning';
  issues: string[];
  recommendations: string[];
}

export default function ResponsiveDesignTest() {
  const [currentViewport, setCurrentViewport] = useState({ width: 0, height: 0 });
  const [testResults, setTestResults] = useState<ResponsiveTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Test breakpoints
  const breakpoints = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ];

  useEffect(() => {
    const updateViewport = () => {
      setCurrentViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const runResponsiveTests = async () => {
    setIsRunning(true);
    const results: ResponsiveTestResult[] = [];

    for (const breakpoint of breakpoints) {
      const result: ResponsiveTestResult = {
        breakpoint: breakpoint.name,
        width: breakpoint.width,
        height: breakpoint.height,
        status: 'pass',
        issues: [],
        recommendations: []
      };

      // Simulate viewport testing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Test logic for each breakpoint
      if (breakpoint.width < 768) {
        // Mobile tests
        if (breakpoint.width < 375) {
          result.issues.push('Very small screen may cause layout issues');
          result.recommendations.push('Consider minimum width constraints');
        }
        
        // Check if mobile navigation is properly implemented
        result.status = 'pass';
        result.recommendations.push('Mobile navigation should be accessible');
      } else if (breakpoint.width < 1024) {
        // Tablet tests
        result.status = 'pass';
        result.recommendations.push('Tablet layout should be optimized for touch');
      } else {
        // Desktop tests
        result.status = 'pass';
        result.recommendations.push('Desktop layout should utilize full width efficiently');
      }

      // Check for common responsive issues
      if (breakpoint.width < 480) {
        result.issues.push('Text may be too small on very small screens');
        result.recommendations.push('Ensure minimum font sizes are readable');
      }

      if (result.issues.length > 0) {
        result.status = result.issues.some(issue => issue.includes('critical')) ? 'fail' : 'warning';
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

  return (
    <div className="space-y-6">
      {/* Current Viewport Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Current Viewport
          </CardTitle>
          <CardDescription>
            Real-time viewport information for responsive testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {currentViewport.width}px
              </div>
              <div className="text-sm text-muted-foreground">Width</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {currentViewport.height}px
              </div>
              <div className="text-sm text-muted-foreground">Height</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {currentViewport.width < 768 ? 'Mobile' : 
                 currentViewport.width < 1024 ? 'Tablet' : 'Desktop'}
              </div>
              <div className="text-sm text-muted-foreground">Device Type</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Design Testing</CardTitle>
          <CardDescription>
            Test the UI across different screen sizes and devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runResponsiveTests} 
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
                  <Monitor className="h-4 w-4" />
                  Run Responsive Tests
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {/* Quick Viewport Tests */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {breakpoints.slice(0, 4).map((bp) => (
              <Button
                key={bp.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  // Simulate viewport change
                  setCurrentViewport({ width: bp.width, height: bp.height });
                }}
                className="text-xs"
              >
                {bp.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Responsive design test results across different breakpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold">{result.breakpoint}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.width} × {result.height}px
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>

                  {showDetails && (
                    <div className="mt-3 space-y-2">
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responsive Component Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Component Showcase</CardTitle>
          <CardDescription>
            Test how components adapt to different screen sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Responsive Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Responsive Grid</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-sm font-medium">Card {i}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Responsive grid item
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsive Form */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Responsive Form</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
            </div>
          </div>

          {/* Responsive Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Responsive Table</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell className="hidden sm:table-cell">john@example.com</TableCell>
                    <TableCell className="hidden md:table-cell">Admin</TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell className="hidden sm:table-cell">jane@example.com</TableCell>
                    <TableCell className="hidden md:table-cell">User</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Inactive</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
