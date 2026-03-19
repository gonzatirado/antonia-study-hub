"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as Sentry from "@sentry/nextjs";
import { signInWithGoogle, onAuthChange } from "@/lib/firebase/auth";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      setUser(user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      Sentry.captureException(err, { extra: { code: firebaseError.code } });

      if (firebaseError.code === "auth/popup-closed-by-user") {
        setError("Cerraste la ventana de inicio de sesión.");
      } else if (firebaseError.code === "auth/popup-blocked") {
        setError("El navegador bloqueó la ventana emergente. Permite popups para este sitio.");
      } else if (firebaseError.code === "auth/unauthorized-domain") {
        setError("Dominio no autorizado. Agrega 'localhost' en Firebase Console → Authentication → Configuración → Dominios autorizados.");
      } else {
        setError(`Error: ${firebaseError.code || firebaseError.message || "Desconocido"}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md bg-card/80 border-border/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">Bienvenido a StudyHub</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Inicia sesión para acceder a tu espacio de estudio
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 border-slate-200 text-base font-medium"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <FcGoogle className="w-5 h-5 mr-2" />
              )}
              Continuar con Google
            </Button>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <p className="text-xs text-muted-foreground text-center pt-4">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
