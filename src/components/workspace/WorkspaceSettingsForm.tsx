// =====================================================
// Workspace Settings Form Component
// Task 20.2: Workspace Provisioning UI
// =====================================================

'use client';

import React, { useState, useEffect } from 'react';
// import { useFormValidation } from '@/hooks/useFormValidation';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';
import { Workspace } from '@/lib/types/workspace';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface WorkspaceSettingsFormData {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
  onUpdate?: (workspace: Workspace) => void;
}

export function WorkspaceSettingsForm({ workspace, onUpdate }: WorkspaceSettingsFormProps) {
  const { hasPermission } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    formData,
    errors,
    handleInputChange,
    validateForm,
    setFieldError,
    clearFieldError,
    setFormData
  } = useFormValidation<WorkspaceSettingsFormData>({
    name: '',
    slug: '',
    description: '',
    is_active: true
  });

  // Initialize form data when workspace changes
  useEffect(() => {
    setFormData({
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description || '',
      is_active: workspace.is_active
    });
  }, [workspace, setFormData]);

  // Check if user has permission to edit workspace
  const canEdit = hasPermission('workspace:manage');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!canEdit) {
      setSubmitError('You do not have permission to edit workspace settings');
      return;
    }

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active
      };

      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update workspace');
      }

      setSubmitSuccess(true);
      onUpdate?.(result.data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error updating workspace:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit) {
    return (
      <FormContainer title="Workspace Settings" description="View workspace settings">
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Workspace Name</h3>
            <p className="text-muted-foreground">{workspace.name}</p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Workspace Slug</h3>
            <p className="text-muted-foreground">{workspace.slug}</p>
          </div>
          
          {workspace.description && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{workspace.description}</p>
            </div>
          )}
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Status</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              workspace.is_active 
                ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
                : 'bg-red-900/30 text-red-400 border border-red-700/50'
            }`}>
              {workspace.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer title="Workspace Settings" description="Manage your workspace settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-xl">
            Workspace settings updated successfully!
          </div>
        )}

        <div className="space-y-4">
          <FormField
            label="Workspace Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Enter workspace name"
            required
          />

          <FormField
            label="Workspace Slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleInputChange}
            error={errors.slug}
            placeholder="workspace-slug"
            required
            helpText="Used in URLs. Only lowercase letters, numbers, and hyphens allowed."
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            placeholder="Optional description for your workspace"
            rows={3}
          />

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange({
                target: {
                  name: 'is_active',
                  value: e.target.checked
                }
              } as React.ChangeEvent<HTMLInputElement>)}
              className="w-4 h-4 text-primary bg-card border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-foreground">
              Workspace is active
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <FormButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Updating Settings..."
          >
            Update Settings
          </FormButton>
        </div>
      </form>
    </FormContainer>
  );
}
