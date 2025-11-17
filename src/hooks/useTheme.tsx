import { useEffect, useState } from "react";

const THEME_COLORS = {
  light: {
    "--background": "200 20% 97%",
    "--foreground": "200 15% 20%",
    "--card": "0 0% 99%",
    "--card-foreground": "200 15% 20%",
    "--primary": "180 50% 45%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "200 15% 92%",
    "--secondary-foreground": "200 15% 20%",
    "--muted": "200 15% 92%",
    "--muted-foreground": "200 10% 50%",
    "--accent": "35 80% 55%",
    "--accent-foreground": "0 0% 100%",
    "--border": "200 15% 90%",
  },
  soft: {
    "--background": "280 30% 96%",
    "--foreground": "280 15% 20%",
    "--card": "280 20% 98%",
    "--card-foreground": "280 15% 20%",
    "--primary": "280 50% 50%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "280 15% 92%",
    "--secondary-foreground": "280 15% 20%",
    "--muted": "280 15% 92%",
    "--muted-foreground": "280 10% 50%",
    "--accent": "320 70% 60%",
    "--accent-foreground": "0 0% 100%",
    "--border": "280 15% 90%",
  },
  neutral: {
    "--background": "0 0% 96%",
    "--foreground": "0 0% 20%",
    "--card": "0 0% 98%",
    "--card-foreground": "0 0% 20%",
    "--primary": "200 10% 40%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "0 0% 92%",
    "--secondary-foreground": "0 0% 20%",
    "--muted": "0 0% 92%",
    "--muted-foreground": "0 0% 50%",
    "--accent": "200 10% 50%",
    "--accent-foreground": "0 0% 100%",
    "--border": "0 0% 90%",
  },
  "high-contrast": {
    "--background": "0 0% 100%",
    "--foreground": "0 0% 0%",
    "--card": "0 0% 100%",
    "--card-foreground": "0 0% 0%",
    "--primary": "0 0% 10%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "0 0% 95%",
    "--secondary-foreground": "0 0% 10%",
    "--muted": "0 0% 95%",
    "--muted-foreground": "0 0% 40%",
    "--accent": "0 0% 30%",
    "--accent-foreground": "0 0% 100%",
    "--border": "0 0% 85%",
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
