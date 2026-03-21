"use client";

import { motion } from "framer-motion";
import { User, CreditCard, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { PLAN_LIMITS } from "@/lib/types";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

export default function SettingsPage() {
  const { user, usage } = useAppStore();
  const plan = user?.plan || "free";
  const limits = PLAN_LIMITS[plan];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">Administra tu cuenta y plan</p>
      </div>

      {/* Profile */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-foreground text-xl">
                {user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium text-foreground">{user?.displayName || "Usuario"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Plan actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge
                className={`text-sm px-3 py-1 ${
                  plan === "premium"
                    ? "bg-gradient-to-r from-warning to-destructive text-foreground"
                    : plan === "pro"
                    ? "bg-gradient-to-r from-primary to-accent text-foreground"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {plan === "free" ? "Gratis" : plan === "pro" ? "Pro" : "Premium"}
              </Badge>
            </div>
            {plan === "free" && (
              <Button className="bg-primary">
                Mejorar plan
              </Button>
            )}
          </div>

          <Separator className="bg-muted" />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground/80">Uso este mes</h4>
            {[
              { label: "Resúmenes", used: usage?.summaries_used ?? 0, limit: usage?.summaries_limit ?? limits.summaries_limit },
              { label: "Quizzes", used: usage?.quizzes_used ?? 0, limit: usage?.quizzes_limit ?? limits.quizzes_limit },
              { label: "Prep. Pruebas", used: usage?.exam_preps_used ?? 0, limit: usage?.exam_preps_limit ?? limits.exam_preps_limit },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground/80">
                    {item.used}/{item.limit === 0 ? "—" : item.limit}
                  </span>
                </div>
                {item.limit > 0 && (
                  <Progress
                    value={(item.used / item.limit) * 100}
                    className="h-1.5 bg-muted"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
