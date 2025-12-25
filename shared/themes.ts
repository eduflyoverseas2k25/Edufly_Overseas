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
    key: "summer",
    label: "Summer",
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
  {
    key: "winter",
    label: "Winter",
    colors: {
      primary: "#3b82f6",
      secondary: "#93c5fd",
      accent: "#1e40af",
      text: "#1e293b",
    },
    hero: {
      style: "light",
      gradientFrom: "#eff6ff",
      gradientVia: "#dbeafe",
      gradientTo: "#e0f2fe",
    },
  },
  {
    key: "autumn",
    label: "Autumn",
    colors: {
      primary: "#d97706",
      secondary: "#b45309",
      accent: "#92400e",
      text: "#1c1917",
    },
    hero: {
      style: "light",
      gradientFrom: "#fef3c7",
      gradientVia: "#fde68a",
      gradientTo: "#fcd34d",
    },
  },
  {
    key: "spring",
    label: "Spring",
    colors: {
      primary: "#10b981",
      secondary: "#34d399",
      accent: "#059669",
      text: "#1e293b",
    },
    hero: {
      style: "light",
      gradientFrom: "#ecfdf5",
      gradientVia: "#d1fae5",
      gradientTo: "#a7f3d0",
    },
  },
  {
    key: "rainy",
    label: "Rainy",
    colors: {
      primary: "#6366f1",
      secondary: "#818cf8",
      accent: "#4f46e5",
      text: "#1e293b",
    },
    hero: {
      style: "dark",
      gradientFrom: "#1e1b4b",
      gradientVia: "#312e81",
      gradientTo: "#3730a3",
      overlayColor: "rgba(30, 27, 75, 0.8)",
      imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80",
    },
  },
  {
    key: "tropical",
    label: "Tropical",
    colors: {
      primary: "#14b8a6",
      secondary: "#f59e0b",
      accent: "#0d9488",
      text: "#134e4a",
    },
    hero: {
      style: "light",
      gradientFrom: "#ccfbf1",
      gradientVia: "#99f6e4",
      gradientTo: "#5eead4",
    },
  },
  {
    key: "sunset",
    label: "Sunset",
    colors: {
      primary: "#f43f5e",
      secondary: "#fb923c",
      accent: "#e11d48",
      text: "#1e293b",
    },
    hero: {
      style: "dark",
      gradientFrom: "#7f1d1d",
      gradientVia: "#991b1b",
      gradientTo: "#b91c1c",
      overlayColor: "rgba(127, 29, 29, 0.7)",
      imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&q=80",
    },
  },
  {
    key: "ocean",
    label: "Ocean",
    colors: {
      primary: "#0891b2",
      secondary: "#06b6d4",
      accent: "#0e7490",
      text: "#164e63",
    },
    hero: {
      style: "dark",
      gradientFrom: "#0c4a6e",
      gradientVia: "#075985",
      gradientTo: "#0369a1",
      overlayColor: "rgba(12, 74, 110, 0.75)",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80",
    },
  },
];

export function getThemeByKey(key: string): ThemePreset | undefined {
  return themePresets.find((t) => t.key === key);
}

export const defaultThemeKey = "summer";
