/**
 * Enhanced Metrics Calculation Functions
 * 
 * This module contains enhanced calculation functions for performance metrics
 * including the new enhanced call logging fields like AOV, ROAS, and revenue tracking.
 */

export interface EnhancedCallData {
  id: string;
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  created_at: string;
  completed_at?: string;
  loss_reason_id?: string;
  // Enhanced call logging fields
  closer_first_name?: string;
  closer_last_name?: string;
  source_of_set_appointment?: 'sdr_booked_call' | 'non_sdr_booked_call' | 'email' | 'vsl' | 'self_booking';
  enhanced_call_outcome?: 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled';
  initial_payment_collected_on?: string;
  customer_full_name?: string;
  customer_email?: string;
  calls_taken?: number;
  setter_first_name?: string;
  setter_last_name?: string;
  cash_collected_upfront?: number;
  total_amount_owed?: number;
  prospect_notes?: string;
  lead_source?: 'organic' | 'ads';
}

export interface EnhancedCalculationResult {
  // Basic metrics
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
  // Enhanced metrics
  enhancedCloseRate: {
    percentage: number;
    closedCalls: number;
    completedCalls: number;
  };
  // Revenue metrics
  revenue: {
    totalCashCollected: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalDeals: number;
  };
  // Lead source metrics
  leadSourcePerformance: {
    organic: {
      calls: number;
      shows: number;
      closes: number;
      revenue: number;
      showRate: number;
      closeRate: number;
    };
    ads: {
      calls: number;
      shows: number;
      closes: number;
      revenue: number;
      showRate: number;
      closeRate: number;
    };
  };
  // ROAS calculation (requires ad spend data)
  roas?: {
    totalAdSpend: number;
    totalRevenue: number;
    roas: number;
  };
  // Appointment source metrics
  appointmentSourcePerformance: {
    sdr_booked_call: number;
    non_sdr_booked_call: number;
    email: number;
    vsl: number;
    self_booking: number;
  };
  // Team performance
  teamPerformance: {
    closers: Array<{
      name: string;
      calls: number;
      shows: number;
      closes: number;
      revenue: number;
      showRate: number;
      closeRate: number;
    }>;
    setters: Array<{
      name: string;
      appointments: number;
      shows: number;
      closes: number;
      showRate: number;
      closeRate: number;
    }>;
  };
  // Overall stats
  totalCalls: number;
  wonCalls: number;
  lostCalls: number;
  tbdCalls: number;
}

/**
 * Calculate Average Order Value (AOV)
 * 
 * @param calls - Array of enhanced call data
 * @returns AOV calculation result
 */
export function calculateAOV(calls: EnhancedCallData[]): {
  averageOrderValue: number;
  totalRevenue: number;
  totalDeals: number;
} {
  const closedCalls = calls.filter(call => 
    call.enhanced_call_outcome === 'closed_paid_in_full' || 
    call.enhanced_call_outcome === 'deposit' ||
    call.enhanced_call_outcome === 'payment_plan'
  );

  if (closedCalls.length === 0) {
    return {
      averageOrderValue: 0,
      totalRevenue: 0,
      totalDeals: 0
    };
  }

  const totalRevenue = closedCalls.reduce((sum, call) => 
    sum + (call.total_amount_owed || 0), 0
  );

  const averageOrderValue = totalRevenue / closedCalls.length;

  return {
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalDeals: closedCalls.length
  };
}

/**
 * Calculate Enhanced Close Rate using enhanced_call_outcome
 * 
 * @param calls - Array of enhanced call data
 * @returns Enhanced close rate calculation result
 */
export function calculateEnhancedCloseRate(calls: EnhancedCallData[]): {
  percentage: number;
  closedCalls: number;
  completedCalls: number;
} {
  const completedCalls = calls.filter(call => call.status === 'completed');
  
  if (completedCalls.length === 0) {
    return {
      percentage: 0,
      closedCalls: 0,
      completedCalls: 0
    };
  }

  const closedCalls = completedCalls.filter(call => 
    call.enhanced_call_outcome === 'closed_paid_in_full' || 
    call.enhanced_call_outcome === 'deposit' ||
    call.enhanced_call_outcome === 'payment_plan'
  );

  const percentage = (closedCalls.length / completedCalls.length) * 100;

  return {
    percentage: Math.round(percentage * 100) / 100,
    closedCalls: closedCalls.length,
    completedCalls: completedCalls.length
  };
}

/**
 * Calculate Lead Source Performance
 * 
 * @param calls - Array of enhanced call data
 * @returns Lead source performance metrics
 */
export function calculateLeadSourcePerformance(calls: EnhancedCallData[]): {
  organic: {
    calls: number;
    shows: number;
    closes: number;
    revenue: number;
    showRate: number;
    closeRate: number;
  };
  ads: {
    calls: number;
    shows: number;
    closes: number;
    revenue: number;
    showRate: number;
    closeRate: number;
  };
} {
  const organicCalls = calls.filter(call => call.lead_source === 'organic');
  const adsCalls = calls.filter(call => call.lead_source === 'ads');

  const calculateSourceMetrics = (sourceCalls: EnhancedCallData[]) => {
    const shows = sourceCalls.filter(call => call.status === 'completed');
    const closes = shows.filter(call => 
      call.enhanced_call_outcome === 'closed_paid_in_full' || 
      call.enhanced_call_outcome === 'deposit' ||
      call.enhanced_call_outcome === 'payment_plan'
    );
    const revenue = closes.reduce((sum, call) => sum + (call.total_amount_owed || 0), 0);
    const showRate = sourceCalls.length > 0 ? (shows.length / sourceCalls.length) * 100 : 0;
    const closeRate = shows.length > 0 ? (closes.length / shows.length) * 100 : 0;

    return {
      calls: sourceCalls.length,
      shows: shows.length,
      closes: closes.length,
      revenue: Math.round(revenue * 100) / 100,
      showRate: Math.round(showRate * 100) / 100,
      closeRate: Math.round(closeRate * 100) / 100
    };
  };

  return {
    organic: calculateSourceMetrics(organicCalls),
    ads: calculateSourceMetrics(adsCalls)
  };
}

/**
 * Calculate ROAS (Return on Ad Spend)
 * 
 * @param calls - Array of enhanced call data
 * @param adSpend - Total ad spend amount
 * @returns ROAS calculation result
 */
export function calculateROAS(calls: EnhancedCallData[], adSpend: number = 0): {
  totalAdSpend: number;
  totalRevenue: number;
  roas: number;
} {
  const adsCalls = calls.filter(call => call.lead_source === 'ads');
  const closedAdsCalls = adsCalls.filter(call => 
    call.enhanced_call_outcome === 'closed_paid_in_full' || 
    call.enhanced_call_outcome === 'deposit' ||
    call.enhanced_call_outcome === 'payment_plan'
  );

  const totalRevenue = closedAdsCalls.reduce((sum, call) => 
    sum + (call.total_amount_owed || 0), 0
  );

  const roas = adSpend > 0 ? totalRevenue / adSpend : 0;

  return {
    totalAdSpend: adSpend,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    roas: Math.round(roas * 100) / 100
  };
}

/**
 * Calculate Appointment Source Performance
 * 
 * @param calls - Array of enhanced call data
 * @returns Appointment source performance metrics
 */
export function calculateAppointmentSourcePerformance(calls: EnhancedCallData[]): {
  sdr_booked_call: number;
  non_sdr_booked_call: number;
  email: number;
  vsl: number;
  self_booking: number;
} {
  const sourceCounts = {
    sdr_booked_call: 0,
    non_sdr_booked_call: 0,
    email: 0,
    vsl: 0,
    self_booking: 0
  };

  calls.forEach(call => {
    if (call.source_of_set_appointment) {
      sourceCounts[call.source_of_set_appointment]++;
    }
  });

  return sourceCounts;
}

/**
 * Calculate Team Performance (Closers and Setters)
 * 
 * @param calls - Array of enhanced call data
 * @returns Team performance metrics
 */
export function calculateTeamPerformance(calls: EnhancedCallData[]): {
  closers: Array<{
    name: string;
    calls: number;
    shows: number;
    closes: number;
    revenue: number;
    showRate: number;
    closeRate: number;
  }>;
  setters: Array<{
    name: string;
    appointments: number;
    shows: number;
    closes: number;
    showRate: number;
    closeRate: number;
  }>;
} {
  // Calculate closer performance
  const closerMap = new Map<string, {
    calls: EnhancedCallData[];
    shows: EnhancedCallData[];
    closes: EnhancedCallData[];
  }>();

  calls.forEach(call => {
    if (call.closer_first_name && call.closer_last_name) {
      const closerName = `${call.closer_first_name} ${call.closer_last_name}`;
      
      if (!closerMap.has(closerName)) {
        closerMap.set(closerName, { calls: [], shows: [], closes: [] });
      }
      
      const closer = closerMap.get(closerName)!;
      closer.calls.push(call);
      
      if (call.status === 'completed') {
        closer.shows.push(call);
      }
      
      if (call.enhanced_call_outcome === 'closed_paid_in_full' || 
          call.enhanced_call_outcome === 'deposit' ||
          call.enhanced_call_outcome === 'payment_plan') {
        closer.closes.push(call);
      }
    }
  });

  const closers = Array.from(closerMap.entries()).map(([name, data]) => {
    const revenue = data.closes.reduce((sum, call) => sum + (call.total_amount_owed || 0), 0);
    const showRate = data.calls.length > 0 ? (data.shows.length / data.calls.length) * 100 : 0;
    const closeRate = data.shows.length > 0 ? (data.closes.length / data.shows.length) * 100 : 0;

    return {
      name,
      calls: data.calls.length,
      shows: data.shows.length,
      closes: data.closes.length,
      revenue: Math.round(revenue * 100) / 100,
      showRate: Math.round(showRate * 100) / 100,
      closeRate: Math.round(closeRate * 100) / 100
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Calculate setter performance
  const setterMap = new Map<string, {
    appointments: EnhancedCallData[];
    shows: EnhancedCallData[];
    closes: EnhancedCallData[];
  }>();

  calls.forEach(call => {
    if (call.setter_first_name && call.setter_last_name) {
      const setterName = `${call.setter_first_name} ${call.setter_last_name}`;
      
      if (!setterMap.has(setterName)) {
        setterMap.set(setterName, { appointments: [], shows: [], closes: [] });
      }
      
      const setter = setterMap.get(setterName)!;
      setter.appointments.push(call);
      
      if (call.status === 'completed') {
        setter.shows.push(call);
      }
      
      if (call.enhanced_call_outcome === 'closed_paid_in_full' || 
          call.enhanced_call_outcome === 'deposit' ||
          call.enhanced_call_outcome === 'payment_plan') {
        setter.closes.push(call);
      }
    }
  });

  const setters = Array.from(setterMap.entries()).map(([name, data]) => {
    const showRate = data.appointments.length > 0 ? (data.shows.length / data.appointments.length) * 100 : 0;
    const closeRate = data.shows.length > 0 ? (data.closes.length / data.shows.length) * 100 : 0;

    return {
      name,
      appointments: data.appointments.length,
      shows: data.shows.length,
      closes: data.closes.length,
      showRate: Math.round(showRate * 100) / 100,
      closeRate: Math.round(closeRate * 100) / 100
    };
  }).sort((a, b) => b.appointments - a.appointments);

  return { closers, setters };
}

/**
 * Calculate comprehensive enhanced metrics from call data
 * 
 * @param calls - Array of enhanced call data
 * @param adSpend - Total ad spend for ROAS calculation (optional)
 * @returns Complete enhanced metrics calculation result
 */
export function calculateEnhancedMetrics(
  calls: EnhancedCallData[], 
  adSpend: number = 0
): EnhancedCalculationResult {
  // Validate input data
  if (!Array.isArray(calls)) {
    throw new Error('Calls data must be an array');
  }

  // Calculate basic metrics (reuse existing functions)
  const completedCalls = calls.filter(call => call.status === 'completed');
  const wonCalls = completedCalls.filter(call => call.outcome === 'won');
  const lostCalls = completedCalls.filter(call => call.outcome === 'lost');
  const tbdCalls = completedCalls.filter(call => call.outcome === 'tbd');

  const showRate = {
    percentage: calls.length > 0 ? Math.round((completedCalls.length / calls.length) * 100 * 100) / 100 : 0,
    completedCalls: completedCalls.length,
    totalCalls: calls.length
  };

  const closeRate = {
    percentage: completedCalls.length > 0 ? Math.round((wonCalls.length / completedCalls.length) * 100 * 100) / 100 : 0,
    wonCalls: wonCalls.length,
    completedCalls: completedCalls.length
  };

  // Calculate enhanced metrics
  const enhancedCloseRate = calculateEnhancedCloseRate(calls);
  const aovData = calculateAOV(calls);
  const leadSourcePerformance = calculateLeadSourcePerformance(calls);
  const appointmentSourcePerformance = calculateAppointmentSourcePerformance(calls);
  const teamPerformance = calculateTeamPerformance(calls);
  
  // Calculate total cash collected
  const totalCashCollected = calls.reduce((sum, call) => 
    sum + (call.cash_collected_upfront || 0), 0
  );

  const revenue = {
    totalCashCollected: Math.round(totalCashCollected * 100) / 100,
    totalRevenue: aovData.totalRevenue,
    averageOrderValue: aovData.averageOrderValue,
    totalDeals: aovData.totalDeals
  };

  // Calculate ROAS if ad spend is provided
  const roas = adSpend > 0 ? calculateROAS(calls, adSpend) : undefined;

  return {
    showRate,
    closeRate,
    enhancedCloseRate,
    revenue,
    leadSourcePerformance,
    roas,
    appointmentSourcePerformance,
    teamPerformance,
    totalCalls: calls.length,
    wonCalls: wonCalls.length,
    lostCalls: lostCalls.length,
    tbdCalls: tbdCalls.length
  };
}

/**
 * Calculate enhanced metrics for a specific date range
 * 
 * @param calls - Array of enhanced call data
 * @param dateFrom - Start date (ISO string)
 * @param dateTo - End date (ISO string)
 * @param adSpend - Total ad spend for ROAS calculation (optional)
 * @returns Enhanced metrics for the specified date range
 */
export function calculateEnhancedMetricsForDateRange(
  calls: EnhancedCallData[],
  dateFrom?: string,
  dateTo?: string,
  adSpend: number = 0
): EnhancedCalculationResult {
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

  return calculateEnhancedMetrics(filteredCalls, adSpend);
}

/**
 * Validate enhanced call data structure
 * 
 * @param call - Enhanced call data to validate
 * @returns True if valid, throws error if invalid
 */
export function validateEnhancedCallData(call: any): call is EnhancedCallData {
  if (!call || typeof call !== 'object') {
    throw new Error('Enhanced call data must be an object');
  }

  if (!call.id || typeof call.id !== 'string') {
    throw new Error('Enhanced call must have a valid id');
  }

  if (!call.status || !['completed', 'no-show', 'rescheduled'].includes(call.status)) {
    throw new Error('Enhanced call must have a valid status (completed, no-show, or rescheduled)');
  }

  if (!call.outcome || !['won', 'lost', 'tbd'].includes(call.outcome)) {
    throw new Error('Enhanced call must have a valid outcome (won, lost, or tbd)');
  }

  if (!call.created_at || typeof call.created_at !== 'string') {
    throw new Error('Enhanced call must have a valid created_at date');
  }

  return true;
}
