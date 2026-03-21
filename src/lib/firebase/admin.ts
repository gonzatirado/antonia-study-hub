import { NextRequest } from "next/server";

interface AuthResult {
  authenticated: boolean;
  uid: string;
}

/**
 * Verifies the Firebase Auth token from the Authorization header.
 * Uses the Firebase REST API to verify ID tokens server-side
 * without requiring firebase-admin SDK (which has issues with edge/turbopack).
 */
export async function verifyAuthToken(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, uid: "" };
  }

  const idToken = authHeader.slice(7);

  if (!idToken || idToken.length < 20) {
    return { authenticated: false, uid: "" };
  }

  try {
    // Use Google's tokeninfo endpoint to verify the Firebase ID token
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error("[auth] NEXT_PUBLIC_FIREBASE_API_KEY not set");
      return { authenticated: false, uid: "" };
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      return { authenticated: false, uid: "" };
    }

    const data = await response.json();
    const users = data.users;

    if (!users || users.length === 0) {
      return { authenticated: false, uid: "" };
    }

    return {
      authenticated: true,
      uid: users[0].localId,
    };
  } catch (error) {
    console.error("[auth] Token verification failed:", error);
    return { authenticated: false, uid: "" };
  }
}
