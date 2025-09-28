'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
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
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin' && session?.user?.role !== 'ceo') {
      router.push('/dashboard');
    } else if (session?.user?.clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: session.user.clientId
      }));
    }
  }, [session, status, router]);

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
      setFormData({ email: '', password: '', name: '', role: 'sales', clientId: session?.user?.clientId || '' });
      
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <FormContainer
            title="User Created Successfully!"
            subtitle="You will be redirected to the users list shortly."
          >
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <p className="text-gray-600">The new user has been created successfully.</p>
            </div>
          </FormContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
                {session?.user?.role === 'ceo' && (
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
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
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

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">Sample Client IDs for testing:</p>
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
