import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    
    // Create a default workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        name: 'Default Agency',
        description: 'Default workspace for the agency',
        is_active: true,
        settings: {
          allow_multiple_clients: true,
          require_approval_for_calls: false,
          default_traffic_source: 'organic'
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default workspace:', error);
      return NextResponse.json(
        { error: 'Failed to create default workspace' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace,
      message: 'Default workspace created successfully'
    });

  } catch (error) {
    console.error('Error in create-default workspace API:', error);
    return NextResponse.json(
      { error: 'Failed to create default workspace' },
      { status: 500 }
    );
  }
}
