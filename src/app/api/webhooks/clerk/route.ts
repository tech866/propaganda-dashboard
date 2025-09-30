import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook event types
interface WebhookEvent {
  type: string;
  data: any;
}

// User event data
interface UserEventData {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  first_name?: string;
  last_name?: string;
  public_metadata?: {
    agency_id?: string;
    role?: string;
    subscription_plan?: string;
  };
  created_at: number;
  updated_at: number;
}

// Organization event data
interface OrganizationEventData {
  id: string;
  name: string;
  slug: string;
  public_metadata?: {
    subscription_plan?: string;
    billing_address?: string;
    contact_info?: any;
  };
  created_at: number;
  updated_at: number;
}

// Organization membership event data
interface OrganizationMembershipEventData {
  id: string;
  organization: {
    id: string;
    name: string;
  };
  public_user_data: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    email_address: string;
  };
  role: string;
  created_at: number;
  updated_at: number;
}

// Handle user events
async function handleUserEvent(type: string, data: UserEventData) {
  const roleType = data.public_metadata?.role || 'agency_user';
  
  // Get role_id from roles table
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('role_type', roleType)
    .single();
  
  if (roleError) {
    console.error('Error fetching role:', roleError);
    throw roleError;
  }

  const userData = {
    id: data.id,
    email: data.email_addresses[0]?.email_address,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    role_id: roleData.id,
    agency_id: data.public_metadata?.agency_id,
    active_status: true,
    created_at: new Date(data.created_at).toISOString(),
    updated_at: new Date(data.updated_at).toISOString(),
  };

  switch (type) {
    case 'user.created':
      const { error: createError } = await supabase
        .from('users')
        .insert(userData);
      
      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
      break;

    case 'user.updated':
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: userData.email,
          name: userData.name,
          role_id: userData.role_id,
          agency_id: userData.agency_id,
          updated_at: userData.updated_at,
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
      break;

    case 'user.deleted':
      const { error: deleteError } = await supabase
        .from('users')
        .update({ active_status: false })
        .eq('id', data.id);
      
      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        throw deleteError;
      }
      break;
  }
}

// Handle organization events
async function handleOrganizationEvent(type: string, data: OrganizationEventData) {
  const agencyData = {
    id: data.id,
    name: data.name,
    subscription_plan: data.public_metadata?.subscription_plan || 'basic',
    billing_address: data.public_metadata?.billing_address,
    contact_info: data.public_metadata?.contact_info,
    active_status: true,
    created_at: new Date(data.created_at).toISOString(),
    updated_at: new Date(data.updated_at).toISOString(),
  };

  switch (type) {
    case 'organization.created':
      const { error: createError } = await supabase
        .from('agencies')
        .insert(agencyData);
      
      if (createError) {
        console.error('Error creating agency:', createError);
        throw createError;
      }
      break;

    case 'organization.updated':
      const { error: updateError } = await supabase
        .from('agencies')
        .update({
          name: agencyData.name,
          subscription_plan: agencyData.subscription_plan,
          billing_address: agencyData.billing_address,
          contact_info: agencyData.contact_info,
          updated_at: agencyData.updated_at,
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating agency:', updateError);
        throw updateError;
      }
      break;

    case 'organization.deleted':
      const { error: deleteError } = await supabase
        .from('agencies')
        .update({ active_status: false })
        .eq('id', data.id);
      
      if (deleteError) {
        console.error('Error deleting agency:', deleteError);
        throw deleteError;
      }
      break;
  }
}

// Handle organization membership events
async function handleOrganizationMembershipEvent(type: string, data: OrganizationMembershipEventData) {
  // Get role_id from roles table
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('role_type', data.role)
    .single();
  
  if (roleError) {
    console.error('Error fetching role for membership:', roleError);
    throw roleError;
  }

  const membershipData = {
    user_id: data.public_user_data.user_id,
    agency_id: data.organization.id,
    role_id: roleData.id,
    created_at: new Date(data.created_at).toISOString(),
    updated_at: new Date(data.updated_at).toISOString(),
  };

  switch (type) {
    case 'organizationMembership.created':
      // Update user's agency_id and role
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          agency_id: data.organization.id,
          role_id: membershipData.role_id,
          updated_at: membershipData.updated_at,
        })
        .eq('id', data.public_user_data.user_id);
      
      if (updateUserError) {
        console.error('Error updating user membership:', updateUserError);
        throw updateUserError;
      }
      break;

    case 'organizationMembership.updated':
      // Update user's role
      const { error: updateRoleError } = await supabase
        .from('users')
        .update({
          role_id: membershipData.role_id,
          updated_at: membershipData.updated_at,
        })
        .eq('id', data.public_user_data.user_id);
      
      if (updateRoleError) {
        console.error('Error updating user role:', updateRoleError);
        throw updateRoleError;
      }
      break;

    case 'organizationMembership.deleted':
      // Get default role_id for agency_user
      const { data: defaultRoleData, error: defaultRoleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_type', 'agency_user')
        .single();
      
      if (defaultRoleError) {
        console.error('Error fetching default role:', defaultRoleError);
        throw defaultRoleError;
      }

      // Remove user from agency
      const { error: removeUserError } = await supabase
        .from('users')
        .update({
          agency_id: null,
          role_id: defaultRoleData.id,
          updated_at: membershipData.updated_at,
        })
        .eq('id', data.public_user_data.user_id);
      
      if (removeUserError) {
        console.error('Error removing user from agency:', removeUserError);
        throw removeUserError;
      }
      break;
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // Verify webhook signature
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Get webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get request body
    const payload = await request.text();
    
    // Create webhook instance
    const wh = new Webhook(webhookSecret);
    
    // Verify webhook
    let evt: WebhookEvent;
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
    }

    // Handle different event types
    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
      case 'user.deleted':
        await handleUserEvent(evt.type, evt.data);
        break;

      case 'organization.created':
      case 'organization.updated':
      case 'organization.deleted':
        await handleOrganizationEvent(evt.type, evt.data);
        break;

      case 'organizationMembership.created':
      case 'organizationMembership.updated':
      case 'organizationMembership.deleted':
        await handleOrganizationMembershipEvent(evt.type, evt.data);
        break;

      default:
        console.log(`Unhandled webhook event type: ${evt.type}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
