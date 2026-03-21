"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Sentry from "@sentry/nextjs";
import { signInWithGoogle, signInWithEmail, onAuthChange } from "@/lib/firebase/auth";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const isLoading = loading || googleLoading;

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  function getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case "auth/invalid-email":
        return "El email no es v\u00e1lido.";
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada.";
      case "auth/user-not-found":
        return "No existe una cuenta con este email.";
      case "auth/wrong-password":
        return "Contrase\u00f1a incorrecta.";
      case "auth/invalid-credential":
        return "Email o contrase\u00f1a incorrectos.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Espera un momento e intenta de nuevo.";
      case "auth/popup-closed-by-user":
        return "Cerraste la ventana de inicio de sesi\u00f3n.";
      case "auth/popup-blocked":
        return "El navegador bloque\u00f3 la ventana emergente. Permite popups para este sitio.";
      case "auth/unauthorized-domain":
        return "Dominio no autorizado. Agrega este dominio en Firebase Console.";
      default:
        return `Error inesperado: ${code}`;
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("El email es obligatorio."); return; }
    if (!password) { setError("La contrase\u00f1a es obligatoria."); return; }

    try {
      setLoading(true);
      setError(null);
      const user = await signInWithEmail(email, password);
      setUser(user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      Sentry.captureException(err, { extra: { code: firebaseError.code } });
      setError(getFirebaseErrorMessage(firebaseError.code || "unknown"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      setUser(user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      Sentry.captureException(err, { extra: { code: firebaseError.code } });
      setError(getFirebaseErrorMessage(firebaseError.code || "unknown"));
    } finally {
      setGoogleLoading(false);
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
                Inicia sesi&oacute;n para continuar tu jornada.
              </p>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@universidad.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pl-10 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Contrase&ntilde;a
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pl-10 pr-10 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={0}
                    aria-label={showPassword ? "Ocultar contrase\u00f1a" : "Mostrar contrase\u00f1a"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-foreground font-bold shadow-lg hover:brightness-110 transition-all mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Iniciar sesi&oacute;n
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border/20" />
              <span className="mx-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold shrink-0">
                o contin&uacute;a con
              </span>
              <div className="flex-grow border-t border-border/20" />
            </div>

            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="w-full h-14 gap-3 rounded-lg border-border/10 bg-secondary hover:bg-muted transition-colors text-base font-semibold"
            >
              {googleLoading ? (
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
            &copy; 2026 StudyHub
          </span>
          <span className="text-[9px] text-muted-foreground">&bull;</span>
          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
            Plataforma Educativa IA
          </span>
        </div>
      </section>

      {/* Floating background glow */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
    </main>
  );
}
