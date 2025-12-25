import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings } from "@shared/schema";

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function hexToHsl(hex: string): string | null {
  if (!isValidHex(hex)) return null;
  
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
    staleTime: 60000,
  });
  
  const appliedRef = useRef<string>("");

  useEffect(() => {
    if (settings) {
      const settingsKey = JSON.stringify(settings);
      if (appliedRef.current === settingsKey) return;
      appliedRef.current = settingsKey;
      
      const root = document.documentElement;
      
      if (settings.primaryColor) {
        const hsl = hexToHsl(settings.primaryColor);
        if (hsl) root.style.setProperty("--primary", hsl);
      }
      if (settings.secondaryColor) {
        const hsl = hexToHsl(settings.secondaryColor);
        if (hsl) root.style.setProperty("--secondary", hsl);
      }
      if (settings.accentColor) {
        const hsl = hexToHsl(settings.accentColor);
        if (hsl) root.style.setProperty("--accent", hsl);
      }
      if (settings.textColor) {
        const hsl = hexToHsl(settings.textColor);
        if (hsl) root.style.setProperty("--foreground", hsl);
      }
    }
  }, [settings]);

  return <>{children}</>;
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
    staleTime: 60000,
  });
}
