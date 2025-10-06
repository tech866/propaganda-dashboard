// =====================================================
// Create Workspace Page
// Task 20.2: Workspace Provisioning UI
// =====================================================

import { Metadata } from 'next';
import { CreateWorkspaceForm } from '@/components/workspace/CreateWorkspaceForm';

export const metadata: Metadata = {
  title: 'Create Workspace | Propaganda Dashboard',
  description: 'Create a new workspace for your team',
};

export default function CreateWorkspacePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  );
}
