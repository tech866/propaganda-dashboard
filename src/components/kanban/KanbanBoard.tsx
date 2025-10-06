'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRBAC } from '@/hooks/useRBAC';
import { RBACGuard } from '@/components/rbac/RBACGuard';
import KanbanColumn from './KanbanColumn';
import CallCard from './CallCard';
import { Call } from '@/lib/types/call';

interface KanbanBoardProps {
  calls: Call[];
  onCallUpdate: (callId: string, updates: Partial<Call>) => Promise<void>;
  onRefresh: () => void;
}

const CRM_STAGES = [
  { id: 'scheduled', title: 'Scheduled', color: 'bg-blue-600', outcome: 'scheduled' },
  { id: 'showed', title: 'Showed', color: 'bg-green-600', outcome: 'showed' },
  { id: 'no_show', title: 'No Show', color: 'bg-red-600', outcome: 'no_show' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-orange-600', outcome: 'cancelled' },
  { id: 'rescheduled', title: 'Rescheduled', color: 'bg-yellow-600', outcome: 'rescheduled' },
  { id: 'closed_won', title: 'Closed/Won', color: 'bg-emerald-600', outcome: 'closed_won' },
  { id: 'disqualified', title: 'Disqualified', color: 'bg-gray-600', outcome: 'disqualified' },
];

export default function KanbanBoard({ calls, onCallUpdate, onRefresh }: KanbanBoardProps) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { checkPermission } = useRBAC({
    workspaceId: currentWorkspace?.id 
  });
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group calls by CRM stage
  const callsByStage = calls.reduce((acc, call) => {
    const stage = call.crm_stage || 'scheduled';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(call);
    return acc;
  }, {} as Record<string, Call[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const call = calls.find(c => c.id === active.id);
    setActiveCall(call || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCall(null);
    
    if (!over) return;

    const callId = active.id as string;
    const newStage = over.id as string;

    // Find the call being moved
    const call = calls.find(c => c.id === callId);
    if (!call || call.crm_stage === newStage) return;

    // Check RBAC permissions for updating calls
    if (!checkPermission('calls:update')) {
      console.warn('User does not have permission to update calls');
      return;
    }

    const oldStage = call.crm_stage;
    const newStageConfig = CRM_STAGES.find(s => s.id === newStage);
    const oldStageConfig = CRM_STAGES.find(s => s.id === oldStage);
    
    setIsUpdating(true);
    
    try {
      // Update call with new stage and outcome
      const updateData: Partial<Call> = { 
        crm_stage: newStage,
        call_outcome: newStageConfig?.outcome || newStage
      };

      // If moving to closed_won, we might want to set actual_call_time
      if (newStage === 'closed_won' && !call.actual_call_time) {
        updateData.actual_call_time = new Date().toISOString();
      }

      await onCallUpdate(callId, updateData);
      
      // Create audit log entry for the stage change
      // Temporarily disabled for testing
      // try {
      //   await fetch(`/api/workspaces/${currentWorkspace.id}/audit-logs`, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       action: 'call_stage_updated',
      //       resource_type: 'call',
      //       resource_id: callId,
      //       details: {
      //         call_id: callId,
      //         prospect_name: call.prospect_name,
      //         old_stage: oldStage,
      //         new_stage: newStage,
      //         old_outcome: oldStageConfig?.outcome,
      //         new_outcome: newStageConfig?.outcome,
      //         traffic_source: call.traffic_source,
      //         company_name: call.company_name,
      //       },
      //       ip_address: null, // Could be extracted from request if needed
      //       user_agent: navigator.userAgent,
      //     }),
      //   });
      // } catch (auditError) {
      //   console.warn('Failed to create audit log for call stage update:', auditError);
      //   // Don't fail the main operation if audit logging fails
      // }
      
      onRefresh(); // Refresh the data
    } catch (error) {
      console.error('Failed to update call stage:', error);
      // You might want to show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">CRM Pipeline</h1>
        <RBACGuard permissions={['calls:update']}>
          <p className="text-muted-foreground">Drag and drop calls between stages to update their status</p>
        </RBACGuard>
        <RBACGuard permissions={['calls:update']} fallback={
          <p className="text-muted-foreground">View-only mode - contact your administrator for editing permissions</p>
        }>
        </RBACGuard>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {CRM_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              calls={callsByStage[stage.id] || []}
              isUpdating={isUpdating}
              canUpdate={checkPermission('calls:update')}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCall ? (
            <CallCard call={activeCall} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
