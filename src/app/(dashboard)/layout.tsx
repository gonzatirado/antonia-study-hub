"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PWAInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/60 backdrop-blur-xl px-6">
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
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </AuthGuard>
  );
}
