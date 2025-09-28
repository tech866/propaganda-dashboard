'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { loginSchema } from '@/lib/validation/clientSchemas';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';

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
      } else {
        // Get the session to verify login
        const session = await getSession();
        if (session) {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <FormContainer
          title="Sign in to your account"
          subtitle="Propaganda Dashboard"
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
              Sign in
            </FormButton>

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">Test accounts:</p>
              <ul className="space-y-1">
                <li>• Sales: test@example.com / password123</li>
                <li>• Admin: admin@example.com / adminpassword</li>
                <li>• CEO: ceo@example.com / ceopassword</li>
              </ul>
            </div>
          </form>
        </FormContainer>
      </div>
    </div>
  );
}
