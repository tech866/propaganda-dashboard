/**
 * Metrics Calculation Functions
 * 
 * This module contains pure calculation functions for performance metrics.
 * These functions are designed to be testable, reusable, and independent of data sources.
 */

export interface CallData {
  id: string;
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  created_at: string;
  completed_at?: string;
  loss_reason_id?: string;
}

export interface LossReasonData {
  id: string;
  reason: string;
}

export interface CalculationResult {
  showRate: {
    percentage: number;
    completedCalls: number;
    totalCalls: number;
  };
  closeRate: {
    percentage: number;
    wonCalls: number;
    completedCalls: number;
  };
  totalCalls: number;
  wonCalls: number;
  lostCalls: number;
  tbdCalls: number;
  lossReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Calculate Show Rate: (Completed Calls / Total Calls) × 100
 * 
 * @param calls - Array of call data
 * @returns Show rate calculation result
 */
export function calculateShowRate(calls: CallData[]): {
  percentage: number;
  completedCalls: number;
  totalCalls: number;
} {
  const totalCalls = calls.length;
  
  if (totalCalls === 0) {
    return {
      percentage: 0,
      completedCalls: 0,
      totalCalls: 0
    };
  }

  const completedCalls = calls.filter(call => call.status === 'completed').length;
  const percentage = (completedCalls / totalCalls) * 100;

  return {
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    completedCalls,
    totalCalls
  };
}

/**
 * Calculate Close Rate: (Won Calls / Completed Calls) × 100
 * 
 * @param calls - Array of call data
 * @returns Close rate calculation result
 */
export function calculateCloseRate(calls: CallData[]): {
  percentage: number;
  wonCalls: number;
  completedCalls: number;
} {
  const completedCalls = calls.filter(call => call.status === 'completed');
  
  if (completedCalls.length === 0) {
    return {
      percentage: 0,
      wonCalls: 0,
      completedCalls: 0
    };
  }

  const wonCalls = completedCalls.filter(call => call.outcome === 'won').length;
  const percentage = (wonCalls / completedCalls.length) * 100;

  return {
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    wonCalls,
    completedCalls: completedCalls.length
  };
}

/**
 * Calculate call outcome statistics
 * 
 * @param calls - Array of call data
 * @returns Call outcome statistics
 */
export function calculateCallOutcomes(calls: CallData[]): {
  totalCalls: number;
  wonCalls: number;
  lostCalls: number;
  tbdCalls: number;
} {
  const completedCalls = calls.filter(call => call.status === 'completed');
  
  return {
    totalCalls: calls.length,
    wonCalls: completedCalls.filter(call => call.outcome === 'won').length,
    lostCalls: completedCalls.filter(call => call.outcome === 'lost').length,
    tbdCalls: completedCalls.filter(call => call.outcome === 'tbd').length
  };
}

/**
 * Calculate top loss reasons with percentages
 * 
 * @param calls - Array of call data
 * @param lossReasons - Array of loss reason data
 * @param limit - Maximum number of loss reasons to return (default: 5)
 * @returns Top loss reasons with counts and percentages
 */
export function calculateLossReasons(
  calls: CallData[], 
  lossReasons: LossReasonData[], 
  limit: number = 5
): Array<{
  reason: string;
  count: number;
  percentage: number;
}> {
  const lostCalls = calls.filter(call => 
    call.status === 'completed' && call.outcome === 'lost' && call.loss_reason_id
  );

  if (lostCalls.length === 0) {
    return [];
  }

  // Create a map of loss reason ID to reason name
  const lossReasonMap = new Map<string, string>();
  lossReasons.forEach(reason => {
    lossReasonMap.set(reason.id, reason.reason);
  });

  // Count occurrences of each loss reason
  const reasonCounts = new Map<string, number>();
  lostCalls.forEach(call => {
    if (call.loss_reason_id) {
      const reason = lossReasonMap.get(call.loss_reason_id);
      if (reason) {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      }
    }
  });

  // Convert to array and calculate percentages
  const result = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / lostCalls.length) * 100 * 100) / 100 // Round to 2 decimal places
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
    .slice(0, limit); // Take top N

  return result;
}

/**
 * Calculate comprehensive metrics from call data
 * 
 * @param calls - Array of call data
 * @param lossReasons - Array of loss reason data
 * @returns Complete metrics calculation result
 */
export function calculateMetrics(
  calls: CallData[], 
  lossReasons: LossReasonData[] = []
): CalculationResult {
  // Validate input data
  if (!Array.isArray(calls)) {
    throw new Error('Calls data must be an array');
  }

  if (!Array.isArray(lossReasons)) {
    throw new Error('Loss reasons data must be an array');
  }

  // Calculate individual metrics
  const showRate = calculateShowRate(calls);
  const closeRate = calculateCloseRate(calls);
  const outcomes = calculateCallOutcomes(calls);
  const lossReasonsData = calculateLossReasons(calls, lossReasons);

  return {
    showRate,
    closeRate,
    totalCalls: outcomes.totalCalls,
    wonCalls: outcomes.wonCalls,
    lostCalls: outcomes.lostCalls,
    tbdCalls: outcomes.tbdCalls,
    lossReasons: lossReasonsData
  };
}

/**
 * Calculate metrics for a specific date range
 * 
 * @param calls - Array of call data
 * @param lossReasons - Array of loss reason data
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @returns Metrics for the specified date range
 */
export function calculateMetricsForDateRange(
  calls: CallData[],
  lossReasons: LossReasonData[] = [],
  dateFrom?: string,
  dateTo?: string
): CalculationResult {
  let filteredCalls = calls;

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filteredCalls = filteredCalls.filter(call => 
      new Date(call.created_at) >= fromDate
    );
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    filteredCalls = filteredCalls.filter(call => 
      new Date(call.created_at) <= toDate
    );
  }

  return calculateMetrics(filteredCalls, lossReasons);
}

/**
 * Calculate trend data for metrics over time
 * 
 * @param calls - Array of call data
 * @param lossReasons - Array of loss reason data
 * @param days - Number of days to analyze (default: 30)
 * @returns Array of daily metrics
 */
export function calculateMetricsTrend(
  calls: CallData[],
  lossReasons: LossReasonData[] = [],
  days: number = 30
): Array<{
  date: string;
  showRate: number;
  closeRate: number;
  totalCalls: number;
  completedCalls: number;
  wonCalls: number;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // Filter calls to the specified date range
  const filteredCalls = calls.filter(call => {
    const callDate = new Date(call.created_at);
    return callDate >= startDate && callDate <= endDate;
  });

  // Group calls by date
  const callsByDate = new Map<string, CallData[]>();
  filteredCalls.forEach(call => {
    const date = new Date(call.created_at).toISOString().split('T')[0];
    if (!callsByDate.has(date)) {
      callsByDate.set(date, []);
    }
    callsByDate.get(date)!.push(call);
  });

  // Calculate metrics for each date
  const trendData = Array.from(callsByDate.entries())
    .map(([date, dayCalls]) => {
      const metrics = calculateMetrics(dayCalls, lossReasons);
      return {
        date,
        showRate: metrics.showRate.percentage,
        closeRate: metrics.closeRate.percentage,
        totalCalls: metrics.totalCalls,
        completedCalls: metrics.showRate.completedCalls,
        wonCalls: metrics.wonCalls
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending

  return trendData;
}

/**
 * Calculate user performance comparison
 * 
 * @param calls - Array of call data
 * @param userIds - Array of user IDs to compare
 * @returns Array of user performance metrics
 */
export function calculateUserPerformance(
  calls: CallData[],
  userIds: string[]
): Array<{
  userId: string;
  showRate: number;
  closeRate: number;
  totalCalls: number;
  wonCalls: number;
}> {
  return userIds.map(userId => {
    const userCalls = calls.filter(call => 
      (call as any).user_id === userId // Assuming user_id is available in call data
    );
    
    const metrics = calculateMetrics(userCalls);
    
    return {
      userId,
      showRate: metrics.showRate.percentage,
      closeRate: metrics.closeRate.percentage,
      totalCalls: metrics.totalCalls,
      wonCalls: metrics.wonCalls
    };
  }).sort((a, b) => b.showRate - a.showRate); // Sort by show rate descending
}

/**
 * Validate call data structure
 * 
 * @param call - Call data to validate
 * @returns True if valid, throws error if invalid
 */
export function validateCallData(call: any): call is CallData {
  if (!call || typeof call !== 'object') {
    throw new Error('Call data must be an object');
  }

  if (!call.id || typeof call.id !== 'string') {
    throw new Error('Call must have a valid id');
  }

  if (!call.status || !['completed', 'no-show', 'rescheduled'].includes(call.status)) {
    throw new Error('Call must have a valid status (completed, no-show, or rescheduled)');
  }

  if (!call.outcome || !['won', 'lost', 'tbd'].includes(call.outcome)) {
    throw new Error('Call must have a valid outcome (won, lost, or tbd)');
  }

  if (!call.created_at || typeof call.created_at !== 'string') {
    throw new Error('Call must have a valid created_at date');
  }

  return true;
}

/**
 * Validate loss reason data structure
 * 
 * @param lossReason - Loss reason data to validate
 * @returns True if valid, throws error if invalid
 */
export function validateLossReasonData(lossReason: any): lossReason is LossReasonData {
  if (!lossReason || typeof lossReason !== 'object') {
    throw new Error('Loss reason data must be an object');
  }

  if (!lossReason.id || typeof lossReason.id !== 'string') {
    throw new Error('Loss reason must have a valid id');
  }

  if (!lossReason.reason || typeof lossReason.reason !== 'string') {
    throw new Error('Loss reason must have a valid reason');
  }

  return true;
}
