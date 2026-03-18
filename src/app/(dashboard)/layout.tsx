"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAppStore } from "@/lib/store";
import { onAuthChange, getUserData } from "@/lib/firebase/auth";
import { getUserUsage } from "@/lib/firebase/usage";
import { Loader2 } from "lucide-react";
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
        console.warn("Retrying user data load...", err);
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [router, setUser, setUsage]);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-6">
            <SidebarTrigger className="text-slate-400 hover:text-white" />
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
