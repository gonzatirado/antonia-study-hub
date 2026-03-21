"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * Forces dark theme while on the landing page, restores user's theme on unmount.
 * This prevents the user's custom theme (e.g. gold, light) from making
 * the dark-designed landing page invisible.
 */
export function LandingThemeForce() {
  const { theme, setTheme } = useTheme();
  const previousTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (theme && theme !== "dark") {
      previousTheme.current = theme;
      setTheme("dark");
    }

    return () => {
      // Restore user's theme when leaving the landing page
      if (previousTheme.current) {
        setTheme(previousTheme.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
