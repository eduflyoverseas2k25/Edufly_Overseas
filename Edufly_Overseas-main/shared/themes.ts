export interface ThemePreset {
  key: string;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  hero: {
    style: "light" | "dark";
    gradientFrom: string;
    gradientVia: string;
    gradientTo: string;
    overlayColor?: string;
    imageUrl?: string;
  };
}

export const themePresets: ThemePreset[] = [
  {
    key: "dark",
    label: "Dark",
    colors: {
      primary: "#ef6e2d",
      secondary: "#fdc22c",
      accent: "#178ab6",
      text: "#1e293b",
    },
    hero: {
      style: "dark",
      gradientFrom: "#1e293b",
      gradientVia: "#334155",
      gradientTo: "#475569",
      overlayColor: "rgba(30, 41, 59, 0.95)",
    },
  },
  {
    key: "multicolor",
    label: "Multi Color",
    colors: {
      primary: "#ef6e2d",      // Orange
      secondary: "#fdc22c",    // Yellow
      accent: "#178ab6",       // Blue
      text: "#1e293b",
    },
    hero: {
      style: "light",
      gradientFrom: "#fbbf24",  // Gold/Yellow
      gradientVia: "#ec4899",   // Pink/Magenta
      gradientTo: "#06b6d4",    // Cyan/Turquoise
      overlayColor: "rgba(255, 255, 255, 0.1)", // Light overlay for text readability
    },
  },
];

export function getThemeByKey(key: string): ThemePreset | undefined {
  return themePresets.find((t) => t.key === key);
}

export const defaultThemeKey = "dark";
