// =====================================================
// Create Workspace Form Component
// Task 20.2: Workspace Provisioning UI
// =====================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useFormValidation } from '@/hooks/useFormValidation';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';
import { generateWorkspaceSlug, validateWorkspaceSlug } from '@/lib/validation/workspaceSchemas';
import { CreateWorkspaceRequest } from '@/lib/types/workspace';

interface CreateWorkspaceFormData {
  name: string;
  slug: string;
  description: string;
}

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateWorkspaceFormData>({
    name: '',
    slug: '',
    description: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    handleInputChange(e);
    
    // Auto-generate slug if it's empty or matches the previous name
    if (!formData.slug || formData.slug === generateWorkspaceSlug(formData.name)) {
      const newSlug = generateWorkspaceSlug(name);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  // Validate slug format
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;
    handleInputChange(e);
    
    if (slug && !validateWorkspaceSlug(slug)) {
      setErrors(prev => ({ ...prev, slug: 'Slug can only contain lowercase letters, numbers, and hyphens' }));
    } else {
      setErrors(prev => ({ ...prev, slug: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Workspace slug is required';
    } else if (!validateWorkspaceSlug(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const workspaceData: CreateWorkspaceRequest = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined
      };

      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create workspace');
      }

      // Redirect to the new workspace
      router.push(`/workspace/${result.data.slug}/dashboard`);
      
    } catch (error) {
      console.error('Error creating workspace:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer title="Create New Workspace" description="Set up a new workspace for your team">
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter workspace name"
              className={`w-full bg-slate-700/50 border text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-red-500' : 'border-slate-600'
              }`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Workspace Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="workspace-slug"
              className={`w-full bg-slate-700/50 border text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.slug ? 'border-red-500' : 'border-slate-600'
              }`}
              required
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-400">{errors.slug}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description for your workspace"
              rows={3}
              className="w-full bg-slate-700/50 border border-slate-600 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          
          <FormButton
            type="submit"
            loading={isSubmitting}
          >
            {isSubmitting ? 'Creating Workspace...' : 'Create Workspace'}
          </FormButton>
        </div>
      </form>
    </FormContainer>
  );
}
