'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { loginSchema } from '@/lib/validation/clientSchemas';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, Shield, Users, BarChart3 } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const { validate, getFieldError, hasFieldError, clearErrors } = useFormValidation(loginSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    clearErrors();

    // Validate form data
    const validationResult = await validate({ email, password });
    
    if (!validationResult.isValid) {
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Get the session to verify login
        const session = await getSession();
        if (session) {
          router.push('/dashboard');
        } else {
          setError('Login successful but session not found. Please try again.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      
      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Propaganda Dashboard</h1>
                  <p className="text-muted-foreground">Sales Analytics Platform</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground leading-tight">
                  Welcome back to your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> sales command center</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Track performance, analyze trends, and optimize your sales strategy with powerful analytics and insights.
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="card-glass border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Secure Access</h3>
                      <p className="text-sm text-muted-foreground">Enterprise-grade security for your data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass border-secondary/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Team Collaboration</h3>
                      <p className="text-sm text-muted-foreground">Work together with your sales team</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center lg:text-left mb-8 lg:hidden">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Propaganda Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Sales Analytics Platform</p>
                </div>
              </div>
            </div>

            <FormContainer
              title="Sign in to your account"
              subtitle="Welcome back! Please enter your details."
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={getFieldError('email')}
                  placeholder="Enter your email"
                  required
                />

                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={getFieldError('password')}
                  placeholder="Enter your password"
                  required
                />

                {error && (
                  <div className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <FormButton
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </FormButton>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/auth/register')}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Create account
                    </button>
                  </p>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
                  <p className="font-medium mb-3 text-foreground flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Test accounts
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Sales</span>
                      <Badge variant="secondary" className="text-xs">test@example.com</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Admin</span>
                      <Badge variant="secondary" className="text-xs">admin@example.com</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">CEO</span>
                      <Badge variant="secondary" className="text-xs">ceo@example.com</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Password: password123 / adminpassword / ceopassword</p>
                </div>
              </form>
            </FormContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
