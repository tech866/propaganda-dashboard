import { auth as clerkAuth } from '@clerk/nextjs/server';

export { clerkAuth as auth };

export async function getCurrentUser() {
  const { userId } = clerkAuth();
  return userId;
}

export async function requireAuth() {
  const userId = await getCurrentUser();
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}
