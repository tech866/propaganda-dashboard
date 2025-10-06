'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Call } from '@/lib/types/call';

interface CallCardProps {
  call: Call;
  isDragging?: boolean;
  canUpdate?: boolean;
}

export default function CallCard({ call, isDragging = false, canUpdate = true }: CallCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: call.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTrafficSourceColor = (source: string) => {
    switch (source) {
      case 'meta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'organic':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrafficSourceIcon = (source: string) => {
    switch (source) {
      case 'meta':
        return '📱';
      case 'organic':
        return '🌱';
      default:
        return '❓';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canUpdate ? attributes : {})}
      {...(canUpdate ? listeners : {})}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:border-slate-600 ${
        canUpdate ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      } ${
        isDragging || isSortableDragging ? 'opacity-50 shadow-2xl' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground text-sm leading-tight">
            {call.prospect_first_name} {call.prospect_last_name}
          </h4>
          {call.company_name && (
            <p className="text-xs text-muted-foreground mt-1">{call.company_name}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs border ${getTrafficSourceColor(call.traffic_source || 'unknown')}`}>
          <span className="mr-1">{getTrafficSourceIcon(call.traffic_source || 'unknown')}</span>
          {call.traffic_source || 'Unknown'}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        {call.prospect_email && (
          <p className="text-xs text-muted-foreground truncate">
            📧 {call.prospect_email}
          </p>
        )}
        {call.prospect_phone && (
          <p className="text-xs text-muted-foreground">
            📞 {call.prospect_phone}
          </p>
        )}
      </div>

      {/* Call Details */}
      <div className="space-y-1 mb-3">
        {call.scheduled_at && (
          <p className="text-xs text-muted-foreground">
            📅 {formatDate(call.scheduled_at)}
          </p>
        )}
        {call.call_duration && (
          <p className="text-xs text-muted-foreground">
            ⏱️ {call.call_duration} min
          </p>
        )}
      </div>

      {/* Source of Appointment */}
      {call.source_of_set_appointment && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            Source: {call.source_of_set_appointment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          {call.source_of_set_appointment === 'sdr_booked_call' && call.sdr_first_name && (
            <p className="text-xs text-muted-foreground">
              SDR: {call.sdr_first_name} {call.sdr_last_name}
            </p>
          )}
        </div>
      )}

      {/* SCRM Outcome */}
      {call.scrms_outcome && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
            {call.scrms_outcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      )}

      {/* Notes Preview */}
      {call.notes && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {call.notes.length > 100 ? `${call.notes.substring(0, 100)}...` : call.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>ID: {call.id.substring(0, 8)}...</span>
        <span>{call.call_type}</span>
      </div>
    </div>
  );
}
