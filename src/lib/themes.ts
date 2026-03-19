export const themes = [
  { id: "light", label: "Claro", icon: "Sun", description: "Limpio y profesional" },
  { id: "dark", label: "Oscuro", icon: "Moon", description: "Suave para los ojos" },
  { id: "midnight", label: "Midnight", icon: "Stars", description: "Azul profundo con destellos" },
  { id: "aurora", label: "Aurora", icon: "Sparkles", description: "Teal y púrpura boreal" },
  { id: "sunset", label: "Sunset", icon: "Sunset", description: "Coral y ámbar cálido" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
