import { getFirebaseAuth } from './config';

/**
 * Gets the current user's Firebase ID token for server-side API authentication.
 * Returns null if no user is signed in.
 */
export async function getAuthToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Returns auth headers for fetch requests to protected API routes.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
