export const themes = [
  { id: "light", label: "Claro", icon: "Sun", description: "Limpio y profesional" },
  { id: "dark", label: "Oscuro", icon: "Moon", description: "Suave para los ojos" },
  { id: "gold", label: "Beige", icon: "Crown", description: "Cálido estilo biblioteca" },
  { id: "midnight", label: "Media Noche", icon: "Stars", description: "Cielo estrellado con luna" },
  { id: "aurora", label: "Aurora Boreal", icon: "Sparkles", description: "Ártico con luces danzantes" },
  { id: "neon", label: "Neón", icon: "Zap", description: "Cyberpunk rosa y azul" },
  { id: "alpes", label: "Alpes", icon: "Mountain", description: "Frescura alpina suiza" },
  { id: "bosque", label: "Bosque", icon: "TreePine", description: "Otoño entre los árboles" },
  { id: "playa", label: "Playa", icon: "Umbrella", description: "Tropical pixel art" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
