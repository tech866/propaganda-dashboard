'use client';

// =====================================================
// Invite Member Modal Component
// Task 20.5: Implement Workspace Management UI Components and Audit Logging
// =====================================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { WorkspaceRole } from '@/lib/types/workspace';

interface InviteMemberModalProps {
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface InviteFormData {
  email: string;
  role: WorkspaceRole;
  customMessage: string;
  expiresInHours: number;
}

const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  admin: 'Full workspace control including member management and settings',
  manager: 'Team management with ability to invite members and manage clients/calls',
  sales_rep: 'Call management with ability to create and update calls',
  client: 'Read-only access to view calls and basic analytics',
  viewer: 'Limited read access to view calls and analytics'
};

const EXPIRY_OPTIONS = [
  { value: 24, label: '24 hours' },
  { value: 72, label: '3 days' },
  { value: 168, label: '7 days' },
  { value: 336, label: '14 days' }
];

export function InviteMemberModal({ workspaceId, onClose, onSuccess }: InviteMemberModalProps) {
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    role: 'sales_rep',
    customMessage: '',
    expiresInHours: 168
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.role) {
      setError('Email and role are required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/workspaces/${workspaceId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          expires_in_hours: formData.expiresInHours,
          custom_message: formData.customMessage || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setSuccess(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof InviteFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (success) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-green-400">Invitation Sent!</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  The invitation has been sent successfully.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Invitation Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge className="bg-green-600 text-white">
                    {formData.role.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="text-foreground">
                    {EXPIRY_OPTIONS.find(opt => opt.value === formData.expiresInHours)?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-foreground max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join this workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value as WorkspaceRole)}
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="admin" className="text-foreground hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS.admin}
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="manager" className="text-foreground hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-medium">Manager</div>
                      <div className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS.manager}
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="sales_rep" className="text-foreground hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="font-medium">Sales Rep</div>
                      <div className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS.sales_rep}
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="client" className="text-foreground hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-medium">Client</div>
                      <div className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS.client}
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="viewer" className="text-foreground hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS.viewer}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires" className="text-foreground">Invitation Expires</Label>
            <Select
              value={formData.expiresInHours.toString()}
              onValueChange={(value) => handleInputChange('expiresInHours', parseInt(value))}
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {EXPIRY_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value.toString()}
                    className="text-foreground hover:bg-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to the invitation..."
              value={formData.customMessage}
              onChange={(e) => handleInputChange('customMessage', e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-foreground"
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-foreground hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
