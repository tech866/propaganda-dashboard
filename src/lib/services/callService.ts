import { query, withTransaction } from '../database';
import { User } from '@/middleware/auth';

export interface Call {
  id: string;
  client_id: string;
  prospect_name: string;
  prospect_email?: string;
  prospect_phone?: string;
  user_id: string;
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  loss_reason_id?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCallData {
  client_id: string;
  prospect_name: string;
  prospect_email?: string;
  prospect_phone?: string;
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  loss_reason_id?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: Date;
  completed_at?: Date;
}

export interface UpdateCallData {
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
}

export class CallService {
  // Get all calls with optional filtering
  static async getCalls(
    user: User,
    filters: {
      clientId?: string;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Call[]> {
    let whereConditions = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    // Multi-tenant filtering - users can only see their client's data
    if (user.role !== 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(user.clientId);
      paramIndex++;
    }

    // Client filtering (for CEO and Admin)
    if (filters.clientId && user.role === 'ceo') {
      whereConditions.push(`client_id = $${paramIndex}`);
      params.push(filters.clientId);
      paramIndex++;
    }

    // User filtering (for Sales users, they can only see their own calls)
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
        id, client_id, prospect_name, prospect_email, prospect_phone, user_id, 
        call_type, status, outcome, loss_reason_id, notes, call_duration,
        scheduled_at, completed_at, created_at, updated_at
      FROM calls 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  // Get a specific call by ID
  static async getCallById(id: string, user: User): Promise<Call | null> {
    let sql = `
      SELECT 
        id, client_id, prospect_name, prospect_email, prospect_phone, user_id, 
        call_type, status, outcome, loss_reason_id, notes, call_duration,
        scheduled_at, completed_at, created_at, updated_at
      FROM calls 
      WHERE id = $1
    `;
    let params = [id];

    // Add multi-tenant filtering
    if (user.role !== 'ceo') {
      sql += ` AND client_id = $2`;
      params.push(user.clientId);
    }

    // Sales users can only see their own calls
    if (user.role === 'sales') {
      sql += ` AND user_id = $${params.length + 1}`;
      params.push(user.id);
    }

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  // Create a new call
  static async createCall(callData: CreateCallData, user: User): Promise<Call> {
    const sql = `
      INSERT INTO calls (
        client_id, prospect_name, prospect_email, prospect_phone, user_id, 
        call_type, status, outcome, loss_reason_id, notes, call_duration,
        scheduled_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, client_id, prospect_name, prospect_email, prospect_phone, user_id, 
        call_type, status, outcome, loss_reason_id, notes, call_duration,
        scheduled_at, completed_at, created_at, updated_at
    `;

    const params = [
      callData.client_id,
      callData.prospect_name,
      callData.prospect_email || null,
      callData.prospect_phone || null,
      user.id, // user_id is always the current user
      callData.call_type,
      callData.status,
      callData.outcome,
      callData.loss_reason_id || null,
      callData.notes || null,
      callData.call_duration || null,
      callData.scheduled_at || null,
      callData.completed_at || null,
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Update an existing call
  static async updateCall(
    id: string,
    updateData: UpdateCallData,
    user: User
  ): Promise<Call | null> {
    // First, check if the call exists and user has permission to update it
    const existingCall = await this.getCallById(id, user);
    if (!existingCall) {
      return null;
    }

    // Sales users can only update their own calls
    if (user.role === 'sales' && existingCall.user_id !== user.id) {
      throw new Error('Access denied: You can only update your own calls');
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return existingCall; // No fields to update
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    params.push(new Date());
    paramIndex++;

    // Add WHERE clause parameters
    params.push(id);
    if (user.role !== 'ceo') {
      params.push(user.clientId);
    }
    if (user.role === 'sales') {
      params.push(user.id);
    }

    const sql = `
      UPDATE calls 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      ${user.role !== 'ceo' ? `AND client_id = $${paramIndex + 1}` : ''}
      ${user.role === 'sales' ? `AND user_id = $${paramIndex + (user.role === 'ceo' ? 1 : 2)}` : ''}
      RETURNING 
        id, client_id, prospect_name, prospect_email, prospect_phone, user_id, 
        call_type, status, outcome, loss_reason_id, notes, call_duration,
        scheduled_at, completed_at, created_at, updated_at
    `;

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  // Delete a call
  static async deleteCall(id: string, user: User): Promise<boolean> {
    // First, check if the call exists and user has permission to delete it
    const existingCall = await this.getCallById(id, user);
    if (!existingCall) {
      return false;
    }

    // Sales users can only delete their own calls
    if (user.role === 'sales' && existingCall.user_id !== user.id) {
      throw new Error('Access denied: You can only delete your own calls');
    }

    let sql = 'DELETE FROM calls WHERE id = $1';
    let params = [id];

    // Add multi-tenant filtering
    if (user.role !== 'ceo') {
      sql += ` AND client_id = $2`;
      params.push(user.clientId);
    }

    // Sales users can only delete their own calls
    if (user.role === 'sales') {
      sql += ` AND user_id = $${params.length + 1}`;
      params.push(user.id);
    }

    const result = await query(sql, params);
    return result.rowCount > 0;
  }

  // Get call statistics for a user/client
  static async getCallStats(
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
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_shows,
        COUNT(CASE WHEN outcome = 'won' THEN 1 END) as total_wins
      FROM calls 
      WHERE ${whereClause}
    `;

    const result = await query(sql, params);
    const stats = result.rows[0];

    const totalCalls = parseInt(stats.total_calls);
    const totalShows = parseInt(stats.total_shows);
    const totalWins = parseInt(stats.total_wins);

    const showRate = totalCalls > 0 ? totalShows / totalCalls : 0;
    const closeRate = totalShows > 0 ? totalWins / totalShows : 0;

    return {
      totalCalls,
      totalShows,
      totalWins,
      showRate,
      closeRate,
    };
  }
}