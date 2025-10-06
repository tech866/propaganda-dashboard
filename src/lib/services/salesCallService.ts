import { query, withTransaction } from '../database';
import { User } from '@/middleware/auth';
import { TrafficSourceService, TrafficSource, SourceOfAppointment, LeadSource } from './trafficSourceService';

// Define the structure of the existing sales_calls table
export interface SalesCall {
  id: string;
  client_id: string;
  campaign_id?: string;
  scheduled_date_time?: Date;
  duration?: number;
  call_outcome: string; // Maps to enhanced_call_outcome
  notes?: string;
  follow_up_actions?: string;
  attendee_list?: string[]; // Assuming JSONB or similar for array
  created_at: Date;
  updated_at: Date;
  // Mapped enhanced fields (some might not exist directly in sales_calls)
  prospect_name?: string; // Added to sales_calls in a previous migration
  prospect_email?: string; // Added to sales_calls in a previous migration
  prospect_phone?: string; // Added to sales_calls in a previous migration
  closer_first_name?: string; // Added to sales_calls in a previous migration
  closer_last_name?: string; // Added to sales_calls in a previous migration
  source?: 'sdr_call' | 'non_sdr_booked'; // Maps to source_of_set_appointment
  traffic_source?: 'organic' | 'paid_ads'; // Maps to lead_source
  enhanced_outcome?: 'no_show' | 'no_close' | 'canceled' | 'disqualified' | 'rescheduled' | 'payment_plan_deposit' | 'close_paid_in_full' | 'follow_call_scheduled'; // Maps to enhanced_call_outcome
  offer_pitched?: string; // No direct mapping, can be part of notes
  setter_first_name?: string; // Added to sales_calls in a previous migration
  setter_last_name?: string; // Added to sales_calls in a previous migration
  cash_collected_upfront?: number; // Added to sales_calls in a previous migration
  total_amount_owed?: number; // Added to sales_calls in a previous migration
  prospect_notes?: string; // Added to sales_calls in a previous migration
}

// Data structure for creating a new sales call from the enhanced form
export interface CreateSalesCallData {
  client_id: string;
  prospect_name: string;
  // Split prospect name into first and last name
  prospect_first_name?: string;
  prospect_last_name?: string;
  prospect_email?: string;
  prospect_phone?: string;
  // Company name (pre-selected from workspace)
  company_name?: string;
  call_type: 'inbound' | 'outbound'; // No direct mapping, will be part of notes or default
  status: 'completed' | 'no-show' | 'rescheduled'; // No direct mapping, will be part of notes or default
  outcome: 'won' | 'lost' | 'tbd'; // No direct mapping, will be part of notes or default
  loss_reason_id?: string; // No direct mapping
  notes?: string;
  call_duration?: number; // Maps to duration
  scheduled_at?: Date; // Maps to scheduled_date_time
  completed_at?: Date; // No direct mapping, can be part of notes or updated_at

  // SCRM-specific fields
  source_of_set_appointment?: 'sdr_booked_call' | 'non_sdr_booked_call';
  sdr_type?: 'dialer' | 'dm_setter';
  sdr_first_name?: string;
  sdr_last_name?: string;
  non_sdr_source?: 'vsl_booking' | 'regular_booking';
  scrms_outcome?: 'call_booked' | 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled';
  
  // CRM and Traffic Source fields
  traffic_source?: 'organic' | 'meta';
  crm_stage?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'closed_won' | 'lost';

  // Enhanced call logging form fields (legacy - mapped to sales_calls where possible)
  closer_first_name?: string;
  closer_last_name?: string;
  source_of_set_appointment_legacy?: 'sdr_booked_call' | 'non_sdr_booked_call' | 'email' | 'vsl' | 'self_booking'; // Maps to 'source'
  enhanced_call_outcome?: 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled'; // Maps to 'call_outcome' or 'enhanced_outcome'
  initial_payment_collected_on?: Date; // No direct mapping
  customer_full_name?: string; // No direct mapping
  customer_email?: string; // Mapped to prospect_email
  calls_taken?: number; // No direct mapping
  setter_first_name?: string;
  setter_last_name?: string;
  cash_collected_upfront?: number;
  total_amount_owed?: number;
  prospect_notes?: string;
  lead_source?: 'organic' | 'ads'; // Maps to 'traffic_source'
}

// Data structure for updating an existing sales call
export interface UpdateSalesCallData {
  prospect_name?: string;
  prospect_email?: string;
  prospect_phone?: string;
  call_type?: 'inbound' | 'outbound';
  status?: 'completed' | 'no-show' | 'rescheduled';
  outcome?: 'won' | 'lost' | 'tbd';
  loss_reason_id?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: Date;
  completed_at?: Date;

  // Enhanced call logging form fields
  closer_first_name?: string;
  closer_last_name?: string;
  source_of_set_appointment?: 'sdr_booked_call' | 'non_sdr_booked_call' | 'email' | 'vsl' | 'self_booking';
  enhanced_call_outcome?: 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled';
  initial_payment_collected_on?: Date;
  customer_full_name?: string;
  customer_email?: string;
  calls_taken?: number;
  setter_first_name?: string;
  setter_last_name?: string;
  cash_collected_upfront?: number;
  total_amount_owed?: number;
  prospect_notes?: string;
  lead_source?: 'organic' | 'ads';
  
  // CRM and Traffic Source fields
  traffic_source?: 'organic' | 'meta';
  crm_stage?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'closed_won' | 'lost';
}

export class SalesCallService {
  /**
   * Get all sales calls for a user or client.
   */
  static async getSalesCalls(
    user: User,
    filters: {
      clientId?: string;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SalesCall[]> {
    let whereConditions = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    // Multi-tenant filtering
    if (user.role !== 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(user.clientId);
      paramIndex++;
    }

    // Client filtering (for CEO)
    if (filters.clientId && user.role === 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(filters.clientId);
      paramIndex++;
    }

    // User filtering (sales users only see their own calls, others can filter)
    if (user.role === 'sales') {
      whereConditions.push(`user_id = $${paramIndex}`);
      params.push(user.id);
      paramIndex++;
    } else if (filters.userId) {
      whereConditions.push(`user_id = $${paramIndex}`);
      params.push(filters.userId);
      paramIndex++;
    }

    // Date filtering
    if (filters.dateFrom) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters.dateTo) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      params.push(filters.dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const sql = `
      SELECT 
        id, client_id, campaign_id, scheduled_date_time, duration, call_outcome, 
        notes, follow_up_actions, attendee_list, created_at, updated_at,
        prospect_name, prospect_email, prospect_phone, closer_first_name, closer_last_name,
        source, traffic_source, enhanced_outcome, setter_first_name, setter_last_name,
        cash_collected_upfront, total_amount_owed, prospect_notes
      FROM sales_calls
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get a single sales call by ID.
   */
  static async getSalesCallById(id: string, user: User): Promise<SalesCall | null> {
    let whereConditions = ['id = $1'];
    let params: any[] = [id];
    let paramIndex = 2;

    // Multi-tenant filtering
    if (user.role !== 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(user.clientId);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const sql = `
      SELECT 
        id, client_id, campaign_id, scheduled_date_time, duration, call_outcome, 
        notes, follow_up_actions, attendee_list, created_at, updated_at,
        prospect_name, prospect_email, prospect_phone, closer_first_name, closer_last_name,
        source, traffic_source, enhanced_outcome, setter_first_name, setter_last_name,
        cash_collected_upfront, total_amount_owed, prospect_notes
      FROM sales_calls
      WHERE ${whereClause}
    `;

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Create a new sales call.
   */
  static async createSalesCall(callData: CreateSalesCallData, user: User): Promise<SalesCall> {
    // Classify traffic source using the new classification service
    const trafficSourceClassification = TrafficSourceService.classifyTrafficSource({
      sourceOfAppointment: callData.source_of_set_appointment as SourceOfAppointment,
      leadSource: callData.lead_source as LeadSource,
      trafficSource: callData.traffic_source as TrafficSource,
      manualOverride: callData.traffic_source as TrafficSource // Use manual selection if provided
    });

    // Use the classified traffic source, with manual override taking precedence
    const finalTrafficSource = callData.traffic_source || trafficSourceClassification.traffic_source;

    const sql = `
      INSERT INTO calls (
        client_id, user_id, prospect_name, prospect_first_name, prospect_last_name, 
        prospect_email, prospect_phone, company_name, call_type, status, outcome,
        scheduled_at, call_duration, notes, loss_reason_id, completed_at,
        source_of_set_appointment, sdr_type, sdr_first_name, sdr_last_name,
        non_sdr_source, scrms_outcome, closer_first_name, closer_last_name,
        source_of_set_appointment_legacy, enhanced_call_outcome, initial_payment_collected_on,
        customer_full_name, customer_email, calls_taken, setter_first_name, setter_last_name,
        cash_collected_upfront, total_amount_owed, prospect_notes, lead_source,
        traffic_source, crm_stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38)
      RETURNING *
    `;

    // Map form fields to calls table columns
    const params = [
      callData.client_id,
      user.id, // user_id is always the current user
      callData.prospect_name || `${callData.prospect_first_name} ${callData.prospect_last_name}`,
      callData.prospect_first_name || null,
      callData.prospect_last_name || null,
      callData.prospect_email || null,
      callData.prospect_phone || null,
      callData.company_name || null,
      callData.call_type,
      callData.status,
      callData.outcome || 'tbd',
      callData.scheduled_at || null,
      callData.call_duration || null,
      callData.notes || null,
      callData.loss_reason_id || null,
      callData.completed_at || null,
      callData.source_of_set_appointment || null,
      callData.sdr_type || null,
      callData.sdr_first_name || null,
      callData.sdr_last_name || null,
      callData.non_sdr_source || null,
      callData.scrms_outcome || 'call_booked',
      callData.closer_first_name || null,
      callData.closer_last_name || null,
      callData.source_of_set_appointment_legacy || null,
      callData.enhanced_call_outcome || null,
      callData.initial_payment_collected_on || null,
      callData.customer_full_name || null,
      callData.customer_email || null,
      callData.calls_taken || null,
      callData.setter_first_name || null,
      callData.setter_last_name || null,
      callData.cash_collected_upfront || 0,
      callData.total_amount_owed || 0,
      callData.prospect_notes || null,
      callData.lead_source || null,
      finalTrafficSource,
      callData.crm_stage || 'scheduled',
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Update an existing sales call.
   */
  static async updateSalesCall(id: string, updateData: UpdateSalesCallData, user: User): Promise<SalesCall | null> {
    // Classify traffic source if source_of_set_appointment is being updated
    let finalTrafficSource = updateData.traffic_source;
    if (updateData.source_of_set_appointment && !updateData.traffic_source) {
      const trafficSourceClassification = TrafficSourceService.classifyTrafficSource({
        sourceOfAppointment: updateData.source_of_set_appointment as SourceOfAppointment,
        leadSource: updateData.lead_source as LeadSource,
        trafficSource: updateData.traffic_source as TrafficSource
      });
      finalTrafficSource = trafficSourceClassification.traffic_source;
    }

    const fields: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    // Map form fields to sales_calls table columns
    if (updateData.prospect_name !== undefined) { fields.push(`prospect_name = $${paramIndex++}`); params.push(updateData.prospect_name); }
    if (updateData.prospect_email !== undefined) { fields.push(`prospect_email = $${paramIndex++}`); params.push(updateData.prospect_email); }
    if (updateData.prospect_phone !== undefined) { fields.push(`prospect_phone = $${paramIndex++}`); params.push(updateData.prospect_phone); }
    if (updateData.scheduled_at !== undefined) { fields.push(`scheduled_date_time = $${paramIndex++}`); params.push(updateData.scheduled_at); }
    if (updateData.call_duration !== undefined) { fields.push(`duration = $${paramIndex++}`); params.push(updateData.call_duration); }
    if (updateData.enhanced_call_outcome !== undefined) { fields.push(`call_outcome = $${paramIndex++}`); params.push(updateData.enhanced_call_outcome); }
    if (updateData.notes !== undefined) { fields.push(`notes = $${paramIndex++}`); params.push(updateData.notes); }
    if (updateData.closer_first_name !== undefined) { fields.push(`closer_first_name = $${paramIndex++}`); params.push(updateData.closer_first_name); }
    if (updateData.closer_last_name !== undefined) { fields.push(`closer_last_name = $${paramIndex++}`); params.push(updateData.closer_last_name); }
    if (updateData.source_of_set_appointment !== undefined) { 
      fields.push(`source = $${paramIndex++}`); 
      params.push(updateData.source_of_set_appointment === 'sdr_booked_call' ? 'sdr_call' : 
                  (updateData.source_of_set_appointment === 'non_sdr_booked_call' ? 'non_sdr_booked' : null)); 
    }
    if (updateData.lead_source !== undefined) { 
      fields.push(`traffic_source = $${paramIndex++}`); 
      params.push(updateData.lead_source === 'organic' ? 'organic' : (updateData.lead_source === 'ads' ? 'meta' : null)); 
    }
    if (finalTrafficSource !== undefined) { 
      fields.push(`traffic_source = $${paramIndex++}`); 
      params.push(finalTrafficSource); 
    }
    if (updateData.crm_stage !== undefined) { 
      fields.push(`crm_stage = $${paramIndex++}`); 
      params.push(updateData.crm_stage); 
    }
    if (updateData.enhanced_call_outcome !== undefined) { fields.push(`enhanced_outcome = $${paramIndex++}`); params.push(updateData.enhanced_call_outcome); }
    if (updateData.setter_first_name !== undefined) { fields.push(`setter_first_name = $${paramIndex++}`); params.push(updateData.setter_first_name); }
    if (updateData.setter_last_name !== undefined) { fields.push(`setter_last_name = $${paramIndex++}`); params.push(updateData.setter_last_name); }
    if (updateData.cash_collected_upfront !== undefined) { fields.push(`cash_collected_upfront = $${paramIndex++}`); params.push(updateData.cash_collected_upfront); }
    if (updateData.total_amount_owed !== undefined) { fields.push(`total_amount_owed = $${paramIndex++}`); params.push(updateData.total_amount_owed); }
    if (updateData.prospect_notes !== undefined) { fields.push(`prospect_notes = $${paramIndex++}`); params.push(updateData.prospect_notes); }

    if (fields.length === 0) {
      return this.getSalesCallById(id, user); // No fields to update
    }

    // Multi-tenant filtering
    if (user.role !== 'ceo') {
      fields.push(`client_id = $${paramIndex++}`);
      params.push(user.clientId);
    }

    const sql = `
      UPDATE calls
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a sales call.
   */
  static async deleteSalesCall(id: string, user: User): Promise<boolean> {
    let whereConditions = ['id = $1'];
    let params: any[] = [id];
    let paramIndex = 2;

    // Multi-tenant filtering
    if (user.role !== 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(user.clientId);
    }

    const whereClause = whereConditions.join(' AND ');

    const sql = `
      DELETE FROM sales_calls
      WHERE ${whereClause}
      RETURNING id
    `;

    const result = await query(sql, params);
    return result.rowCount > 0;
  }

  /**
   * Get sales call statistics.
   */
  static async getSalesCallStats(
    user: User,
    filters: {
      clientId?: string;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<{
    totalCalls: number;
    totalShows: number;
    totalWins: number;
    totalEnhancedCloses: number;
    totalCashCollected: number;
    totalRevenue: number;
    averageOrderValue: number;
    showRate: number;
    closeRate: number;
  }> {
    let whereConditions = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    // Multi-tenant filtering
    if (user.role !== 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(user.clientId);
      paramIndex++;
    }

    // Client filtering (for CEO)
    if (filters.clientId && user.role === 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(filters.clientId);
      paramIndex++;
    }

    // User filtering
    if (user.role === 'sales') {
      whereConditions.push(`user_id = $${paramIndex}`);
      params.push(user.id);
      paramIndex++;
    } else if (filters.userId) {
      whereConditions.push(`user_id = $${paramIndex}`);
      params.push(filters.userId);
      paramIndex++;
    }

    // Date filtering
    if (filters.dateFrom) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters.dateTo) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      params.push(filters.dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const sql = `
      SELECT 
        COUNT(*) as total_calls,
        COUNT(CASE WHEN call_outcome = 'completed' THEN 1 END) as total_shows, -- Assuming 'completed' maps to show
        COUNT(CASE WHEN call_outcome = 'close_paid_in_full' OR call_outcome = 'payment_plan_deposit' THEN 1 END) as total_wins, -- Assuming these map to won
        COUNT(CASE WHEN enhanced_outcome = 'close_paid_in_full' OR enhanced_outcome = 'payment_plan_deposit' THEN 1 END) as total_enhanced_closes,
        SUM(COALESCE(cash_collected_upfront, 0)) as total_cash_collected,
        SUM(COALESCE(total_amount_owed, 0)) as total_revenue,
        AVG(COALESCE(total_amount_owed, 0)) as average_order_value
      FROM sales_calls 
      WHERE ${whereClause}
    `;

    const result = await query(sql, params);
    const stats = result.rows[0];

    const totalCalls = parseInt(stats.total_calls) || 0;
    const totalShows = parseInt(stats.total_shows) || 0;
    const totalWins = parseInt(stats.total_wins) || 0;
    const totalEnhancedCloses = parseInt(stats.total_enhanced_closes) || 0;
    const totalCashCollected = parseFloat(stats.total_cash_collected) || 0;
    const totalRevenue = parseFloat(stats.total_revenue) || 0;
    const averageOrderValue = parseFloat(stats.average_order_value) || 0;

    const showRate = totalCalls > 0 ? totalShows / totalCalls : 0;
    const closeRate = totalShows > 0 ? totalWins / totalShows : 0;

    return {
      totalCalls,
      totalShows,
      totalWins,
      totalEnhancedCloses,
      totalCashCollected,
      totalRevenue,
      averageOrderValue,
      showRate,
      closeRate,
    };
  }
}