import { useEffect, useState } from "react";

const THEME_COLORS = {
  light: {
    "--background": "200 20% 97%",
    "--foreground": "200 15% 20%",
    "--primary": "180 50% 45%",
    "--accent": "35 80% 55%",
  },
  soft: {
    "--background": "280 30% 96%",
    "--foreground": "280 15% 20%",
    "--primary": "280 50% 50%",
    "--accent": "320 70% 60%",
  },
  neutral: {
    "--background": "0 0% 96%",
    "--foreground": "0 0% 20%",
    "--primary": "200 10% 40%",
    "--accent": "200 10% 50%",
  },
  "high-contrast": {
    "--background": "0 0% 100%",
    "--foreground": "0 0% 0%",
    "--primary": "0 0% 10%",
    "--accent": "0 0% 30%",
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
