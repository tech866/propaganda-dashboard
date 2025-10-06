export interface Call {
  id: string;
  client_id: string;
  workspace_id?: string;
  user_id: string;
  
  // Prospect Information
  prospect_name: string;
  prospect_first_name?: string;
  prospect_last_name?: string;
  prospect_email?: string;
  prospect_phone?: string;
  company_name?: string;
  
  // Call Details
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome?: 'won' | 'lost' | 'tbd';
  loss_reason_id?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: string;
  completed_at?: string;
  
  // Source Information
  source_of_set_appointment?: 'sdr_booked_call' | 'non_sdr_booked_call';
  sdr_type?: 'dialer' | 'dm_setter';
  sdr_first_name?: string;
  sdr_last_name?: string;
  non_sdr_source?: 'vsl_booking' | 'regular_booking';
  
  // SCRM and CRM Fields
  scrms_outcome?: 'call_booked' | 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled';
  traffic_source?: 'organic' | 'meta';
  crm_stage?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'closed_won' | 'lost';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CallCreateData {
  client_id: string;
  prospect_name: string;
  prospect_first_name?: string;
  prospect_last_name?: string;
  prospect_email?: string;
  prospect_phone?: string;
  company_name?: string;
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome?: 'won' | 'lost' | 'tbd';
  loss_reason_id?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: string;
  completed_at?: string;
  source_of_set_appointment?: 'sdr_booked_call' | 'non_sdr_booked_call';
  sdr_type?: 'dialer' | 'dm_setter';
  sdr_first_name?: string;
  sdr_last_name?: string;
  non_sdr_source?: 'vsl_booking' | 'regular_booking';
  scrms_outcome?: 'call_booked' | 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled';
  traffic_source?: 'organic' | 'meta';
  crm_stage?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'closed_won' | 'lost';
}

export interface CallUpdateData {
  prospect_name?: string;
  prospect_first_name?: string;
  prospect_last_name?: string;
  prospect_email?: string;
  prospect_phone?: string;
  company_name?: string;
  call_type?: 'inbound' | 'outbound';
  status?: 'completed' | 'no-show' | 'rescheduled';
  outcome?: 'won' | 'lost' | 'tbd';
  loss_reason_id?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: string;
  completed_at?: string;
  source_of_set_appointment?: 'sdr_booked_call' | 'non_sdr_booked_call';
  sdr_type?: 'dialer' | 'dm_setter';
  sdr_first_name?: string;
  sdr_last_name?: string;
  non_sdr_source?: 'vsl_booking' | 'regular_booking';
  scrms_outcome?: 'call_booked' | 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled';
  traffic_source?: 'organic' | 'meta';
  crm_stage?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'closed_won' | 'lost';
}
