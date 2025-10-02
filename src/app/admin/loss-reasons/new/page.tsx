'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, isLoaded } = useAuth();
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
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user && user.publicMetadata?.role !== 'admin' && user.publicMetadata?.role !== 'ceo') {
      router.push('/dashboard');
    }
  }, [user, isLoaded, router]);

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destructive mx-auto"></div>
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
            title="Loss Reason Created Successfully!"
            subtitle="You will be redirected to the loss reasons list shortly."
          >
            <div className="text-center">
              <div className="text-destructive text-6xl mb-4">✓</div>
              <p className="text-muted-foreground">The new loss reason has been created successfully.</p>
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

            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              error={getFieldError('description')}
              placeholder="Optional description of this loss reason..."
              rows={3}
            />

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
              <div className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 p-3 rounded-md">
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
                variant="danger"
                className="flex-1"
              >
                Create Loss Reason
              </FormButton>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
              <p className="font-medium mb-2 text-foreground">Tips for creating effective loss reasons:</p>
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
