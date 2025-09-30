'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication for development
    setTimeout(() => {
      if (email && password) {
        // Mock successful login
        router.push('/dashboard');
      } else {
        setError('Please enter both email and password');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Development mode - show mock sign-in form
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Access your agency dashboard
            </p>
          </div>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Development Mode</CardTitle>
              <CardDescription className="text-gray-300">
                This is a mock sign-in form for development. Enter any email and password to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <Alert className="bg-red-900/50 border-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-300">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Development Mode Active</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  Authentication is bypassed. You'll be redirected to the dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Production mode - use Clerk (when properly configured)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Access your agency dashboard
          </p>
        </div>
        <div className="mt-8">
          <Alert className="bg-yellow-900/50 border-yellow-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-300">
              Clerk authentication is not configured. Please set up your Clerk keys in the environment variables.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
