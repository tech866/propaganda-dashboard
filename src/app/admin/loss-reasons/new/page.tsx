'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';

interface LossReasonFormData {
  name: string;
  description: string;
  category: string;
}

const lossReasonSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  description: {
    required: false,
    maxLength: 500
  },
  category: {
    required: true,
    minLength: 2,
    maxLength: 50
  }
};

const predefinedCategories = [
  'Interest Level',
  'Financial',
  'Timing',
  'Competition',
  'Process',
  'Technical',
  'Other'
];

export default function NewLossReason() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<LossReasonFormData>({
    name: '',
    description: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { validate, getFieldError, hasFieldError, clearErrors } = useFormValidation(lossReasonSchema);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin' && session?.user?.role !== 'ceo') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // TODO: Replace with actual API call when available
      // For now, we'll simulate a successful creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setFormData({ name: '', description: '', category: '' });
      
      // Redirect to loss reasons list after successful creation
      setTimeout(() => {
        router.push('/admin/loss-reasons');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create loss reason');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
            title="Loss Reason Created Successfully!"
            subtitle="You will be redirected to the loss reasons list shortly."
          >
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">✓</div>
              <p className="text-gray-600">The new loss reason has been created successfully.</p>
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
          title="Create New Loss Reason"
          subtitle="Add a new loss reason category for call tracking"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Loss Reason Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              error={getFieldError('name')}
              placeholder="e.g., Not Interested, Budget Constraints"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description of this loss reason..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  getFieldError('description') ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {getFieldError('description') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
              )}
            </div>

            <FormField
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleInputChange}
              error={getFieldError('category')}
              required
            >
              <option value="">Select a category</option>
              {predefinedCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </FormField>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <FormButton
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/loss-reasons')}
                className="flex-1"
              >
                Cancel
              </FormButton>
              <FormButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Create Loss Reason
              </FormButton>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">Tips for creating effective loss reasons:</p>
              <ul className="space-y-1 text-xs">
                <li>• Use clear, specific names that sales teams will understand</li>
                <li>• Group similar reasons into logical categories</li>
                <li>• Keep descriptions concise but informative</li>
                <li>• Consider the most common objections your team faces</li>
              </ul>
            </div>
          </form>
        </FormContainer>
      </div>
    </div>
  );
}
