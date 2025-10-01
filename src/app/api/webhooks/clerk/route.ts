import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = headers();
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
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
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
      case 'user.updated':
        await handleUserSync(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeletion(evt.data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
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

async function handleUserSync(userData: any) {
  if (!supabase) {
    console.warn('Supabase client not configured, skipping user sync');
    return;
  }

  const { id: clerkUserId, email_addresses, first_name, last_name, public_metadata } = userData;
  
  const email = email_addresses?.[0]?.email_address;
  const name = `${first_name || ''} ${last_name || ''}`.trim();
  
  if (!email) {
    console.error('No email found for user:', clerkUserId);
    return;
  }

  try {
    // Call the sync function
    const { data, error } = await supabase.rpc('sync_clerk_user', {
      p_clerk_user_id: clerkUserId,
      p_email: email,
      p_name: name,
      p_metadata: public_metadata || {}
    });

    if (error) {
      console.error('Error syncing user:', error);
      throw error;
    }

    console.log(`User synced successfully: ${clerkUserId} -> ${data}`);
  } catch (error) {
    console.error('Failed to sync user:', error);
    throw error;
  }
}

async function handleUserDeletion(userData: any) {
  if (!supabase) {
    console.warn('Supabase client not configured, skipping user deletion');
    return;
  }

  const { id: clerkUserId } = userData;
  
  try {
    // Mark user as inactive instead of deleting
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }

    console.log(`User deactivated: ${clerkUserId}`);
  } catch (error) {
    console.error('Failed to deactivate user:', error);
    throw error;
  }
}