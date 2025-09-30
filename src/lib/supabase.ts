// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

// Check if we're using placeholder values (development mode)
const isDevelopment = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (if needed)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Export development flag for conditional logic
export const isSupabaseConfigured = !isDevelopment

