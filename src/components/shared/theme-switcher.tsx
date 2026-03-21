"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Stars, Sparkles, Crown, Zap, Mountain, TreePine, Umbrella, Check } from "lucide-react";
import { themes } from "@/lib/themes";
import { springs } from "@/lib/animations";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Moon,
  Stars,
  Sparkles,
  Crown,
  Zap,
  Mountain,
  TreePine,
  Umbrella,
};

const previewColors: Record<string, { bg: string; card: string; accent: string; text: string; image?: string }> = {
  light: { bg: "#f5f3ff", card: "#ffffff", accent: "#6d28d9", text: "#1e1b4b" },
  dark: { bg: "#1e1b2e", card: "#2a2740", accent: "#8b7cf6", text: "#e8e4f0" },
  midnight: { bg: "#0d0a2a", card: "#161240", accent: "#4d7cff", text: "#c8d0f0", image: "/themes/fondo-medianoche.png" },
  aurora: { bg: "#0a1f1a", card: "#122b24", accent: "#34d399", text: "#c8f0e0", image: "/themes/fondo-aurora.png" },
  gold: { bg: "#f0ead2", card: "#f5f0e1", accent: "#8a7e3b", text: "#3a3525" },
  neon: { bg: "#120818", card: "#1e0e2a", accent: "#ff2d9b", text: "#f0d0ff", image: "/themes/fondo-neon.png" },
  alpes: { bg: "#f0f5fa", card: "#ffffff", accent: "#3b82c8", text: "#1a2a40", image: "/themes/fondo-alpes.png" },
  bosque: { bg: "#1a1c14", card: "#252818", accent: "#d4883a", text: "#e8e0c8", image: "/themes/fondo-bosque.png" },
  playa: { bg: "#faf5eb", card: "#fff8ee", accent: "#1a9aa0", text: "#2a3530", image: "/themes/fondo-playa.png" },
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
        const colors = previewColors[t.id] ?? previewColors.dark;
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
            style={{
              backgroundColor: colors.bg,
              ...(colors.image ? {
                backgroundImage: `linear-gradient(to bottom, ${colors.bg}cc 0%, ${colors.bg}88 100%), url(${colors.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } : {}),
            }}
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
