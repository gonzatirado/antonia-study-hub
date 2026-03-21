import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 proxy — replaces middleware.ts.
 * Runs on Node.js runtime. Protects dashboard routes by checking
 * for a Firebase session cookie (`__session`).
 *
 * Client-side code must set `document.cookie = "__session=<idToken>"`
 * after Firebase Auth sign-in so the proxy can verify it server-side.
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/subjects",
  "/grades",
  "/summaries",
  "/quizzes",
  "/exam-prep",
  "/pendings",
  "/pomodoro",
  "/schedule",
  "/settings",
];

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/api/",
  "/_next/",
];

const PUBLIC_EXTENSIONS = [
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".woff",
  ".woff2",
  ".ttf",
  ".css",
  ".js",
  ".map",
  ".json",
  ".webmanifest",
];

function isPublicPath(pathname: string): boolean {
  // Root path is public
  if (pathname === "/") return true;

  // Public route prefixes
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // Static file extensions
  if (PUBLIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return true;
  }

  return false;
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Allow public paths through without any check
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Only gate protected routes — let unknown routes pass through
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Check for Firebase session cookie
  const sessionCookie = request.cookies.get("__session")?.value;

  if (!sessionCookie || sessionCookie.length < 20) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optionally verify the token with Firebase REST API.
  // For performance, we only do a lightweight check here:
  // the token exists and looks plausible (length check above).
  // Full verification happens in API routes / server components
  // via verifyAuthToken() from src/lib/firebase/admin.ts.
  //
  // To enable server-side token verification on every navigation,
  // uncomment the block below:
  //
  // const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  // if (apiKey) {
  //   try {
  //     const res = await fetch(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ idToken: sessionCookie }),
  //       }
  //     );
  //     const data = await res.json();
  //     if (!res.ok || !data.users?.length) {
  //       const loginUrl = request.nextUrl.clone();
  //       loginUrl.pathname = "/login";
  //       loginUrl.searchParams.set("redirect", pathname);
  //       return NextResponse.redirect(loginUrl);
  //     }
  //   } catch {
  //     // On verification failure, redirect to login
  //     const loginUrl = request.nextUrl.clone();
  //     loginUrl.pathname = "/login";
  //     loginUrl.searchParams.set("redirect", pathname);
  //     return NextResponse.redirect(loginUrl);
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subjects/:path*",
    "/grades/:path*",
    "/summaries/:path*",
    "/quizzes/:path*",
    "/exam-prep/:path*",
    "/pendings/:path*",
    "/pomodoro/:path*",
    "/schedule/:path*",
    "/settings/:path*",
  ],
};
