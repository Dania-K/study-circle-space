import { useEffect, useState } from "react";

const THEME_COLORS = {
  light: {
    "--background": "42 60% 97%",
    "--foreground": "0 0% 31%",
    "--card": "42 60% 97%",
    "--card-foreground": "0 0% 31%",
    "--primary": "115 25% 80%",
    "--primary-foreground": "0 0% 31%",
    "--secondary": "30 20% 85%",
    "--secondary-foreground": "0 0% 31%",
    "--muted": "30 20% 85%",
    "--muted-foreground": "0 0% 45%",
    "--accent": "0 35% 55%",
    "--accent-foreground": "42 60% 97%",
    "--border": "30 15% 88%",
    "--input": "30 15% 88%",
    "--ring": "115 25% 80%",
  },
  warm: {
    "--background": "35 55% 96%",
    "--foreground": "25 20% 25%",
    "--card": "35 55% 96%",
    "--card-foreground": "25 20% 25%",
    "--primary": "25 60% 65%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "35 35% 82%",
    "--secondary-foreground": "25 20% 25%",
    "--muted": "35 35% 82%",
    "--muted-foreground": "25 15% 45%",
    "--accent": "15 70% 55%",
    "--accent-foreground": "0 0% 100%",
    "--border": "35 25% 85%",
    "--input": "35 25% 85%",
    "--ring": "25 60% 65%",
  },
  forest: {
    "--background": "140 30% 95%",
    "--foreground": "140 25% 20%",
    "--card": "140 30% 95%",
    "--card-foreground": "140 25% 20%",
    "--primary": "140 50% 55%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "140 20% 88%",
    "--secondary-foreground": "140 25% 20%",
    "--muted": "140 20% 88%",
    "--muted-foreground": "140 15% 45%",
    "--accent": "100 60% 50%",
    "--accent-foreground": "0 0% 100%",
    "--border": "140 20% 85%",
    "--input": "140 20% 85%",
    "--ring": "140 50% 55%",
  },
  midnight: {
    "--background": "220 20% 12%",
    "--foreground": "0 0% 95%",
    "--card": "220 20% 15%",
    "--card-foreground": "0 0% 95%",
    "--primary": "115 25% 60%",
    "--primary-foreground": "0 0% 10%",
    "--secondary": "220 15% 20%",
    "--secondary-foreground": "0 0% 95%",
    "--muted": "220 15% 20%",
    "--muted-foreground": "0 0% 70%",
    "--accent": "0 35% 50%",
    "--accent-foreground": "0 0% 95%",
    "--border": "220 15% 25%",
    "--input": "220 15% 25%",
    "--ring": "115 25% 60%",
  },
};

export const useTheme = () => {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("user_theme") || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName: string) => {
    const colors = THEME_COLORS[themeName as keyof typeof THEME_COLORS] || THEME_COLORS.light;
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("user_theme", newTheme);
    applyTheme(newTheme);
  };

  return { theme, changeTheme };
};
