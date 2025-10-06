'use client';

// =====================================================
// Email Testing Page (Development Only)
// Task 20.3: Secure Email Invitation System Testing
// =====================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  testType: string;
  email: string;
  timestamp?: string;
}

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [testType, setTestType] = useState('config');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTest = async () => {
    if (!email && testType !== 'config') {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType,
          email: testType === 'config' ? null : email
        }),
      });

      const result = await response.json();
      
      setResults(prev => [{
        ...result,
        timestamp: new Date().toISOString()
      }, ...prev]);
      
    } catch (error) {
      setResults(prev => [{
        success: false,
        message: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        testType,
        email,
        timestamp: new Date().toISOString()
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const testConfig = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/test-email');
      const result = await response.json();
      
      setResults(prev => [{
        ...result,
        testType: 'config',
        email: 'N/A',
        timestamp: new Date().toISOString()
      }, ...prev]);
      
    } catch (error) {
      setResults(prev => [{
        success: false,
        message: 'Configuration test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        testType: 'config',
        email: 'N/A',
        timestamp: new Date().toISOString()
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Email System Testing</h1>
          <p className="text-muted-foreground">Test email configuration and templates</p>
        </div>

        {/* Test Configuration */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testType" className="text-foreground">Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="config">Configuration Test</SelectItem>
                    <SelectItem value="invitation">Invitation Email</SelectItem>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runTest}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Run Test'
                )}
              </Button>
              
              <Button 
                onClick={testConfig}
                disabled={loading}
                variant="outline"
                className="border-slate-600 text-foreground hover:bg-slate-700"
              >
                Test Config Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {results.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="text-foreground">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border border-slate-600 bg-slate-700/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={result.success ? "default" : "destructive"}
                              className={result.success ? "bg-green-600" : "bg-red-600"}
                            >
                              {result.testType}
                            </Badge>
                            {result.email !== 'N/A' && (
                              <span className="text-sm text-muted-foreground">{result.email}</span>
                            )}
                          </div>
                          <p className="text-foreground">{result.message}</p>
                        </div>
                      </div>
                      
                      <span className="text-xs text-muted-foreground">
                        {result.timestamp && new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables Info */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardHeader>
            <CardTitle className="text-foreground">Required Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">SMTP Configuration:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• SMTP_HOST</li>
                    <li>• SMTP_PORT</li>
                    <li>• SMTP_SECURE</li>
                    <li>• SMTP_USER</li>
                    <li>• SMTP_PASS</li>
                    <li>• SMTP_FROM</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Application:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• NEXT_PUBLIC_APP_URL</li>
                  </ul>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">
                See <code className="bg-slate-700 px-2 py-1 rounded">src/docs/email-configuration.md</code> for setup instructions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
