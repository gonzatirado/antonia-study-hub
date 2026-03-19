"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Stars, Sparkles, Sunset, Check } from "lucide-react";
import { themes } from "@/lib/themes";
import { springs } from "@/lib/animations";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Moon,
  Stars,
  Sparkles,
  Sunset,
};

const previewColors: Record<string, { bg: string; card: string; accent: string; text: string }> = {
  light: { bg: "#f5f3ff", card: "#ffffff", accent: "#6d28d9", text: "#1e1b4b" },
  dark: { bg: "#1e1b2e", card: "#2a2740", accent: "#8b7cf6", text: "#e8e4f0" },
  midnight: { bg: "#0d0a2a", card: "#161240", accent: "#4d7cff", text: "#c8d0f0" },
  aurora: { bg: "#0a1f1a", card: "#122b24", accent: "#34d399", text: "#c8f0e0" },
  sunset: { bg: "#1f0f0a", card: "#2b1812", accent: "#f97316", text: "#f0d8c8" },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {themes.map((t) => {
        const Icon = iconMap[t.icon];
        const colors = previewColors[t.id];
        const isActive = theme === t.id;

        return (
          <motion.button
            key={t.id}
            onClick={() => setTheme(t.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springs.snappy}
            className={`relative group rounded-xl p-3 text-left transition-all ${
              isActive
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "hover:ring-1 hover:ring-border"
            }`}
            style={{ backgroundColor: colors.bg }}
          >
            {/* Mini preview */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.card }}
              >
                {Icon && <span style={{ color: colors.accent }}><Icon className="w-4 h-4" /></span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: colors.text }}>
                  {t.label}
                </p>
                <p className="text-[10px] truncate" style={{ color: colors.text, opacity: 0.6 }}>
                  {t.description}
                </p>
              </div>
            </div>
            {/* Preview bars */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: colors.accent }} />
                <div className="h-1.5 rounded-full w-4" style={{ backgroundColor: colors.card }} />
              </div>
              <div className="flex gap-1.5">
                <div className="h-1.5 rounded-full w-6" style={{ backgroundColor: colors.card }} />
                <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: colors.card }} />
              </div>
            </div>
            {/* Active check */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springs.bounce}
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.accent }}
              >
                <Check className="w-3 h-3" style={{ color: colors.bg }} />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
