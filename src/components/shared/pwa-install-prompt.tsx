"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-prompt-dismissed") === "true";
    }
    return false;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {deferredPrompt && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-2xl shadow-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Instala StudyHub
              </p>
              <p className="text-xs text-muted-foreground">
                Accede mas rapido desde tu pantalla de inicio
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/90"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground/80"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
