'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { registerSchema } from '@/lib/validation/clientSchemas';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield, Users, BarChart3, CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    clientId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const { validate, getFieldError, hasFieldError, clearErrors } = useFormValidation(registerSchema);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error when user starts typing
    if (getFieldError(name)) {
      clearErrors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    clearErrors();

    // Validate form data
    const validationResult = await validate(formData);
    
    if (!validationResult.isValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      setSuccess(true);
      setFormData({ email: '', password: '', name: '', clientId: '' });
      
      // Redirect to login after successful registration
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-background to-primary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        
        <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <FormContainer
              title="Registration Successful!"
              subtitle="Welcome to Propaganda Dashboard"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Account Created Successfully!</h3>
                  <p className="text-muted-foreground">Your account has been created and you'll be redirected to the login page shortly.</p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Redirecting in a moment...</span>
                </div>
              </div>
            </FormContainer>
          </div>
        </div>
      </div>
    );
  }

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
                  Join the future of
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> sales analytics</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Create your account and start tracking performance, analyzing trends, and optimizing your sales strategy with powerful insights.
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="card-glass border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Easy Setup</h3>
                      <p className="text-sm text-muted-foreground">Get started in minutes with our simple onboarding</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass border-secondary/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Secure & Private</h3>
                      <p className="text-sm text-muted-foreground">Your data is protected with enterprise-grade security</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Registration Form */}
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
              title="Create your account"
              subtitle="Join the Propaganda Dashboard and start your journey."
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={getFieldError('name')}
                    placeholder="Enter your full name"
                    required
                  />

                  <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={getFieldError('email')}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={getFieldError('password')}
                    placeholder="Enter your password"
                    required
                  />

                  <FormField
                    label="Client ID"
                    name="clientId"
                    type="text"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    error={getFieldError('clientId')}
                    placeholder="Enter your client UUID"
                    required
                  />
                </div>

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
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </FormButton>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/auth/signin')}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
                  <p className="font-medium mb-3 text-foreground flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Sample Client IDs for testing
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Propaganda Inc</span>
                      <Badge variant="secondary" className="text-xs">550e8400-e29b-41d4-a716-446655440001</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Tech Solutions</span>
                      <Badge variant="secondary" className="text-xs">550e8400-e29b-41d4-a716-446655440002</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Marketing Pro</span>
                      <Badge variant="secondary" className="text-xs">550e8400-e29b-41d4-a716-446655440003</Badge>
                    </div>
                  </div>
                </div>
              </form>
            </FormContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
