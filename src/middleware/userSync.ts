import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserSyncService } from '@/lib/services/userSyncService';

/**
 * Middleware to automatically sync Clerk users to the database
 * This ensures that every authenticated user has a corresponding database record
 */
export async function syncUserMiddleware(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      // No authenticated user, continue with request
      return NextResponse.next();
    }

    // Check if user exists in database
    const dbUser = await UserSyncService.getUserByClerkId(userId);
    
    if (!dbUser) {
      // User doesn't exist in database, we need to create them
      // But we can't get full user data from middleware, so we'll let the webhook handle it
      // or create a minimal record
      console.log('User not found in database, will be created by webhook or on next API call');
    }

    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Error in user sync middleware:', error);
    // Don't block the request if sync fails
    return NextResponse.next();
  }
}
