'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { registerSchema } from '@/lib/validation/clientSchemas';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <FormContainer
            title="Registration Successful!"
            subtitle="You will be redirected to the login page shortly."
          >
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <p className="text-gray-600">Your account has been created successfully.</p>
            </div>
          </FormContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <FormContainer
          title="Create your account"
          subtitle="Join the Propaganda Dashboard"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <FormButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Create Account
            </FormButton>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/signin')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </button>
              </p>
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
