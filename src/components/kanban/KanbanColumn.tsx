'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CallCard from './CallCard';
import { Call } from '@/lib/types/call';

interface KanbanColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  calls: Call[];
  isUpdating: boolean;
  canUpdate: boolean;
}

export default function KanbanColumn({ stage, calls, isUpdating, canUpdate }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${stage.color} text-white p-4 rounded-t-2xl`}>
        <h3 className="font-semibold text-lg">{stage.title}</h3>
        <p className="text-sm opacity-90">{calls.length} calls</p>
      </div>

      {/* Column Content */}
      <div
        ref={canUpdate ? setNodeRef : undefined}
        className={`flex-1 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-b-2xl p-4 min-h-[400px] transition-colors duration-200 ${
          isOver && canUpdate ? 'bg-slate-700/50' : ''
        } ${isUpdating ? 'opacity-50 pointer-events-none' : ''} ${!canUpdate ? 'cursor-not-allowed' : ''}`}
      >
        {canUpdate ? (
          <SortableContext items={calls.map(call => call.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {calls.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No calls in this stage</p>
                </div>
              ) : (
                calls.map((call) => (
                  <CallCard key={call.id} call={call} canUpdate={canUpdate} />
                ))
              )}
            </div>
          </SortableContext>
        ) : (
          <div className="space-y-3">
            {calls.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">No calls in this stage</p>
              </div>
            ) : (
              calls.map((call) => (
                <CallCard key={call.id} call={call} canUpdate={canUpdate} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
