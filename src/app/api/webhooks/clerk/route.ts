import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Clerk webhook secret
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Check for webhook secret
  if (!WEBHOOK_SECRET) {
    return new Response('CLERK_WEBHOOK_SECRET not configured', {
      status: 500,
    });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Webhook with an ID of ${evt.id} and type of ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(userData: any) {
  console.log('Creating user in database:', userData.id);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_user_id: userData.id,
      email: userData.email_addresses?.[0]?.email_address || '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      role: 'agency_user', // Default role for new users
      client_id: 'default-client', // Required field
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }

  console.log('User created successfully:', data.id);
}

async function handleUserUpdated(userData: any) {
  console.log('Updating user in database:', userData.id);
  
  const { data, error } = await supabase
    .from('users')
    .update({
      email: userData.email_addresses?.[0]?.email_address || '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', userData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user in database:', error);
    throw error;
  }

  console.log('User updated successfully:', data.id);
}

async function handleUserDeleted(userData: any) {
  console.log('Deleting user from database:', userData.id);
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_user_id', userData.id);

  if (error) {
    console.error('Error deleting user from database:', error);
    throw error;
  }

  console.log('User deleted successfully');
}