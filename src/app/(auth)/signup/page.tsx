"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Sentry from "@sentry/nextjs";
import { signUpWithEmail, signInWithGoogle, onAuthChange } from "@/lib/firebase/auth";
import { useAppStore } from "@/lib/store";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  function validateForm(): string | null {
    if (!name.trim()) return "El nombre es obligatorio.";
    if (!email.trim()) return "El email es obligatorio.";
    if (password.length < 6) return "La contrase\u00f1a debe tener al menos 6 caracteres.";
    if (password !== confirmPassword) return "Las contrase\u00f1as no coinciden.";
    return null;
  }

  function getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con este email.";
      case "auth/invalid-email":
        return "El email no es v\u00e1lido.";
      case "auth/weak-password":
        return "La contrase\u00f1a es demasiado d\u00e9bil. Usa al menos 6 caracteres.";
      case "auth/operation-not-allowed":
        return "El registro con email est\u00e1 deshabilitado. Contacta al administrador.";
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

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await signUpWithEmail(email, password, name.trim());
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

  async function handleGoogleSignup() {
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

  const isLoading = loading || googleLoading;

  return (
    <div data-theme="dark" className="min-h-screen flex items-center justify-center p-6">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="w-full bg-card/80 border-border/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">Comienza tu jornada</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                \u00danete a la \u00e9lite acad\u00e9mica
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Escribe tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pl-10 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

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
                  Contrase\u00f1a
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pl-10 pr-10 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Confirmar contrase\u00f1a
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pl-10 pr-10 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                Crear cuenta
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  o contin\u00faa con
                </span>
              </div>
            </div>

            {/* Google Sign-In */}
            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 border-slate-200 text-base font-medium"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <FcGoogle className="w-5 h-5 mr-2" />
              )}
              Google
            </Button>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Login Link */}
            <p className="text-muted-foreground text-sm text-center pt-2">
              \u00bfYa tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline underline-offset-4 transition-all"
              >
                Inicia sesi\u00f3n
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
