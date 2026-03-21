"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
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
        setError("Cerraste la ventana de inicio de sesion.");
      } else if (firebaseError.code === "auth/popup-blocked") {
        setError("El navegador bloqueo la ventana emergente. Permite popups para este sitio.");
      } else if (firebaseError.code === "auth/unauthorized-domain") {
        setError("Dominio no autorizado. Agrega 'localhost' en Firebase Console > Authentication > Dominios autorizados.");
      } else {
        setError(`Error: ${firebaseError.code || firebaseError.message || "Desconocido"}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main data-theme="dark" className="flex min-h-screen bg-background text-foreground">
      {/* Left Side: Cinematic Visual (desktop only) */}
      <section className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-background">
        {/* Cinematic gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, oklch(0.65 0.25 295 / 0.15) 0%, transparent 70%)",
          }}
        />
        {/* Abstract orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] z-0 bg-primary/10" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-[100px] z-0 bg-primary/5" />

        {/* Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10"
        >
          <span className="text-3xl font-bold tracking-tighter text-primary">
            StudyHub
          </span>
        </motion.div>

        {/* Center Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 max-w-xl"
        >
          <h1 className="text-7xl font-extrabold tracking-tighter leading-tight mb-6">
            Unete a la{" "}
            <span className="text-primary">Elite</span>.
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed opacity-80">
            Accede al santuario digital disenado para academicos de alto
            rendimiento. Optimiza tu trayectoria universitaria con herramientas
            de precision.
          </p>
        </motion.div>

        {/* Bottom spacer */}
        <div className="relative z-10" />
      </section>

      {/* Right Side: Auth Form */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-card p-8 md:p-16 lg:p-24 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Branding */}
          <div className="lg:hidden mb-12 flex justify-center">
            <span className="text-2xl font-bold tracking-tighter text-primary">
              StudyHub
            </span>
          </div>

          {/* Form Section */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Bienvenido de nuevo
              </h2>
              <p className="text-muted-foreground text-sm">
                Inicia sesion para continuar tu jornada.
              </p>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border/20" />
              <span className="mx-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold shrink-0">
                Continua con
              </span>
              <div className="flex-grow border-t border-border/20" />
            </div>

            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full h-14 gap-3 rounded-lg border-border/10 bg-secondary hover:bg-muted transition-colors text-base font-semibold"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <FcGoogle className="size-5" />
              )}
              Google
            </Button>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm text-center bg-destructive/10 rounded-lg px-4 py-3"
              >
                {error}
              </motion.p>
            )}

            {/* Create account link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No tienes cuenta?{" "}
                <Link
                  href="/signup"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>

            {/* Legal Text */}
            <p className="text-center text-[11px] text-muted-foreground leading-relaxed opacity-60 px-4">
              Al registrarte aceptas los{" "}
              <Link
                href="/terms"
                className="text-foreground font-medium hover:text-primary underline transition-colors"
              >
                Terminos de Servicio
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacy"
                className="text-foreground font-medium hover:text-primary underline transition-colors"
              >
                Politica de Privacidad
              </Link>{" "}
              de StudyHub.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-auto pt-8 flex gap-6 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
            &copy; 2025 StudyHub
          </span>
          <span className="text-[9px] text-muted-foreground">&bull;</span>
          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
            Digital Sanctuary
          </span>
        </div>
      </section>

      {/* Floating background glow */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
    </main>
  );
}
