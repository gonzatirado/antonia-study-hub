"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <h2 className="text-lg font-semibold text-foreground">Error de autenticación</h2>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        {error.message || "No pudimos procesar tu solicitud."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary hover:bg-primary/90 text-foreground rounded-lg text-sm transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
