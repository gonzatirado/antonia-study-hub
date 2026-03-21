"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { onAuthChange, getUserData } from "@/lib/firebase/auth";
import { getUserUsage } from "@/lib/firebase/usage";
import { Loader2 } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

/**
 * Client-side auth guard that wraps dashboard content.
 * - Listens to Firebase auth state changes
 * - Refreshes the __session cookie for proxy.ts
 * - Redirects to /login if no user
 * - Loads user data + usage into Zustand store
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser, setUsage } = useAppStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        document.cookie = "__session=; path=/; max-age=0";
        router.push("/login");
        return;
      }

      // Refresh __session cookie so proxy.ts stays in sync
      try {
        const token = await firebaseUser.getIdToken();
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
      } catch { /* token refresh failed — cookie will expire naturally */ }

      try {
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          setUser(userData);
          const usage = await getUserUsage(userData.uid);
          setUsage(usage);
        }
      } catch (err) {
        Sentry.captureException(err, { extra: { context: "user data load" } });
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [router, setUser, setUsage]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
