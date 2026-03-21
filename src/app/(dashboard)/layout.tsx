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
            <header className="sticky top-0 z-40 flex h-10 items-center px-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </header>
            <main className="flex-1 px-6 pb-6 max-w-7xl mx-auto w-full">
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
