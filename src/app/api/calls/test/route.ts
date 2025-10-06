import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockCalls = [
      {
        id: '1',
        prospect_name: 'John Smith',
        company_name: 'Acme Corp',
        phone: '+1-555-0123',
        email: 'john@acme.com',
        crm_stage: 'scheduled',
        call_outcome: 'scheduled',
        traffic_source: 'organic',
        source_of_appointment: 'email',
        cash_collected: 0,
        scheduled_call_time: '2025-01-15T14:00:00Z',
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-01-10T10:00:00Z'
      },
      {
        id: '2',
        prospect_name: 'Sarah Johnson',
        company_name: 'Tech Solutions Inc',
        phone: '+1-555-0456',
        email: 'sarah@techsolutions.com',
        crm_stage: 'showed',
        call_outcome: 'showed',
        traffic_source: 'meta',
        source_of_appointment: 'sdr_booked_call',
        cash_collected: 0,
        scheduled_call_time: '2025-01-14T15:30:00Z',
        actual_call_time: '2025-01-14T15:30:00Z',
        created_at: '2025-01-09T09:00:00Z',
        updated_at: '2025-01-14T15:30:00Z'
      },
      {
        id: '3',
        prospect_name: 'Mike Davis',
        company_name: 'Digital Marketing Co',
        phone: '+1-555-0789',
        email: 'mike@digitalmarketing.com',
        crm_stage: 'closed_won',
        call_outcome: 'closed_won',
        traffic_source: 'organic',
        source_of_appointment: 'vsl',
        cash_collected: 5000,
        scheduled_call_time: '2025-01-13T11:00:00Z',
        actual_call_time: '2025-01-13T11:00:00Z',
        created_at: '2025-01-08T14:00:00Z',
        updated_at: '2025-01-13T11:00:00Z'
      },
      {
        id: '4',
        prospect_name: 'Lisa Wilson',
        company_name: 'StartupXYZ',
        phone: '+1-555-0321',
        email: 'lisa@startupxyz.com',
        crm_stage: 'no_show',
        call_outcome: 'no_show',
        traffic_source: 'meta',
        source_of_appointment: 'facebook_ads',
        cash_collected: 0,
        scheduled_call_time: '2025-01-12T16:00:00Z',
        created_at: '2025-01-07T12:00:00Z',
        updated_at: '2025-01-12T16:00:00Z'
      },
      {
        id: '5',
        prospect_name: 'Robert Brown',
        company_name: 'Enterprise Systems',
        phone: '+1-555-0654',
        email: 'robert@enterprisesystems.com',
        crm_stage: 'cancelled',
        call_outcome: 'cancelled',
        traffic_source: 'organic',
        source_of_appointment: 'referral',
        cash_collected: 0,
        scheduled_call_time: '2025-01-11T13:00:00Z',
        created_at: '2025-01-06T16:00:00Z',
        updated_at: '2025-01-11T13:00:00Z'
      },
      {
        id: '6',
        prospect_name: 'Emily Chen',
        company_name: 'Innovation Labs',
        phone: '+1-555-0987',
        email: 'emily@innovationlabs.com',
        crm_stage: 'rescheduled',
        call_outcome: 'rescheduled',
        traffic_source: 'meta',
        source_of_appointment: 'google_ads',
        cash_collected: 0,
        scheduled_call_time: '2025-01-16T10:00:00Z',
        created_at: '2025-01-05T11:00:00Z',
        updated_at: '2025-01-10T14:00:00Z'
      },
      {
        id: '7',
        prospect_name: 'David Martinez',
        company_name: 'Growth Partners',
        phone: '+1-555-0123',
        email: 'david@growthpartners.com',
        crm_stage: 'disqualified',
        call_outcome: 'disqualified',
        traffic_source: 'organic',
        source_of_appointment: 'self_booking',
        cash_collected: 0,
        scheduled_call_time: '2025-01-09T14:30:00Z',
        actual_call_time: '2025-01-09T14:30:00Z',
        created_at: '2025-01-04T09:00:00Z',
        updated_at: '2025-01-09T14:30:00Z'
      }
    ];

    return NextResponse.json({ 
      calls: mockCalls,
      message: 'Test calls data loaded successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error in test calls API:', error);
    return NextResponse.json({ error: 'Failed to fetch test calls' }, { status: 500 });
  }
}
