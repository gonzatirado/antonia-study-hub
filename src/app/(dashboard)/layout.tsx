"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAppStore } from "@/lib/store";
import { onAuthChange, getUserData } from "@/lib/firebase/auth";
import { getUserUsage } from "@/lib/firebase/usage";
import { Loader2 } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { PWAInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser, setUsage } = useAppStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        router.push("/login");
        return;
      }

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </header>
          <main className="flex-1 p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </SidebarInset>
      </div>
      <PWAInstallPrompt />
    </SidebarProvider>
  );
}
