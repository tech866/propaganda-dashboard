'use client';

import { useState, useCallback } from 'react';
import { TrafficSourceService, TrafficSource, SourceOfAppointment, LeadSource } from '@/lib/services/trafficSourceService';

interface UseTrafficSourceClassificationReturn {
  classifyTrafficSource: (data: {
    sourceOfAppointment?: SourceOfAppointment;
    leadSource?: LeadSource;
    trafficSource?: TrafficSource;
    manualOverride?: TrafficSource;
  }) => {
    traffic_source: TrafficSource;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  };
  getTrafficSourceOptions: () => Array<{ value: TrafficSource; label: string; description: string }>;
  getSourceOfAppointmentOptions: () => Array<{ 
    value: SourceOfAppointment; 
    label: string; 
    description: string;
    typicalTrafficSource: TrafficSource;
  }>;
  getTrafficSourceDisplayInfo: (trafficSource: TrafficSource) => {
    label: string;
    description: string;
    color: string;
    icon: string;
  };
  getAnalyticsLabel: (trafficSource: TrafficSource) => string;
  isValidTrafficSource: (value: string) => value is TrafficSource;
  getStandardizedTrafficSource: (input: string | null | undefined) => TrafficSource;
}

/**
 * Hook for traffic source classification and management
 * Provides consistent traffic source logic throughout the application
 */
export const useTrafficSourceClassification = (): UseTrafficSourceClassificationReturn => {
  const classifyTrafficSource = useCallback((data: {
    sourceOfAppointment?: SourceOfAppointment;
    leadSource?: LeadSource;
    trafficSource?: TrafficSource;
    manualOverride?: TrafficSource;
  }) => {
    return TrafficSourceService.classifyTrafficSource(data);
  }, []);

  const getTrafficSourceOptions = useCallback(() => {
    return TrafficSourceService.getTrafficSourceOptions();
  }, []);

  const getSourceOfAppointmentOptions = useCallback(() => {
    return TrafficSourceService.getSourceOfAppointmentOptions();
  }, []);

  const getTrafficSourceDisplayInfo = useCallback((trafficSource: TrafficSource) => {
    return TrafficSourceService.getTrafficSourceDisplayInfo(trafficSource);
  }, []);

  const getAnalyticsLabel = useCallback((trafficSource: TrafficSource) => {
    return TrafficSourceService.getAnalyticsLabel(trafficSource);
  }, []);

  const isValidTrafficSource = useCallback((value: string): value is TrafficSource => {
    return TrafficSourceService.isValidTrafficSource(value);
  }, []);

  const getStandardizedTrafficSource = useCallback((input: string | null | undefined): TrafficSource => {
    return TrafficSourceService.getStandardizedTrafficSource(input);
  }, []);

  return {
    classifyTrafficSource,
    getTrafficSourceOptions,
    getSourceOfAppointmentOptions,
    getTrafficSourceDisplayInfo,
    getAnalyticsLabel,
    isValidTrafficSource,
    getStandardizedTrafficSource,
  };
};

export default useTrafficSourceClassification;
