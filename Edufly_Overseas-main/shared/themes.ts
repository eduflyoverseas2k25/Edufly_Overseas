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
    key: "light",
    label: "Light",
    colors: {
      primary: "#ef6e2d",
      secondary: "#fdc22c",
      accent: "#178ab6",
      text: "#1e293b",
    },
    hero: {
      style: "light",
      gradientFrom: "#fff7ed",
      gradientVia: "#fef3c7",
      gradientTo: "#ffedd5",
    },
  },
];

export function getThemeByKey(key: string): ThemePreset | undefined {
  return themePresets.find((t) => t.key === key);
}

export const defaultThemeKey = "dark";
