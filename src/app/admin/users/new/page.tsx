'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createUserSchema } from '@/lib/validation/clientSchemas';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';

interface UserFormData {
  email: string;
  password: string;
  name: string;
  role: 'sales' | 'admin' | 'ceo';
  clientId: string;
}

export default function NewUser() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    role: 'sales',
    clientId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { validate, getFieldError, hasFieldError, clearErrors } = useFormValidation(createUserSchema);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user && user.publicMetadata?.role !== 'admin' && user.publicMetadata?.role !== 'ceo') {
      router.push('/dashboard');
    } else if (user?.publicMetadata?.agency_id) {
      setFormData(prev => ({
        ...prev,
        clientId: user.publicMetadata.agency_id as string
      }));
    }
  }, [user, isLoaded, router]);

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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create user');
      }

      setSuccess(true);
      setFormData({ email: '', password: '', name: '', role: 'sales', clientId: user?.publicMetadata?.agency_id as string || '' });
      
      // Redirect to users list after successful creation
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <FormContainer
            title="User Created Successfully!"
            subtitle="You will be redirected to the users list shortly."
          >
            <div className="text-center">
              <div className="text-success text-6xl mb-4">✓</div>
              <p className="text-muted-foreground">The new user has been created successfully.</p>
            </div>
          </FormContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <FormContainer
          title="Create New User"
          subtitle="Add a new user to the system"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={getFieldError('name')}
                placeholder="Enter full name"
                required
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={getFieldError('email')}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={getFieldError('password')}
                placeholder="Enter password"
                required
              />

              <FormField
                label="Role"
                name="role"
                type="select"
                value={formData.role}
                onChange={handleInputChange}
                error={getFieldError('role')}
                required
              >
                <option value="">Select role</option>
                <option value="sales">Sales</option>
                <option value="admin">Admin</option>
                {user?.publicMetadata?.role === 'ceo' && (
                  <option value="ceo">CEO</option>
                )}
              </FormField>
            </div>

            <FormField
              label="Client ID"
              name="clientId"
              type="text"
              value={formData.clientId}
              onChange={handleInputChange}
              error={getFieldError('clientId')}
              placeholder="Enter client UUID"
              required
            />

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <FormButton
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/users')}
                className="flex-1"
              >
                Cancel
              </FormButton>
              <FormButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                Create User
              </FormButton>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
              <p className="font-medium mb-2 text-foreground">Sample Client IDs for testing:</p>
              <ul className="space-y-1 text-xs">
                <li>• 550e8400-e29b-41d4-a716-446655440001 (Propaganda Inc)</li>
                <li>• 550e8400-e29b-41d4-a716-446655440002 (Tech Solutions)</li>
                <li>• 550e8400-e29b-41d4-a716-446655440003 (Marketing Pro)</li>
              </ul>
            </div>
          </form>
        </FormContainer>
      </div>
    </div>
  );
}
