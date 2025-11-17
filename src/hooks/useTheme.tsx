import { useEffect, useState } from "react";

const THEME_COLORS = {
  light: {
    "--background": "200 20% 98%",
    "--foreground": "200 15% 15%",
    "--card": "0 0% 100%",
    "--card-foreground": "200 15% 15%",
    "--primary": "200 70% 50%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "200 15% 93%",
    "--secondary-foreground": "200 15% 15%",
    "--muted": "200 15% 93%",
    "--muted-foreground": "200 10% 45%",
    "--accent": "200 80% 60%",
    "--accent-foreground": "0 0% 100%",
    "--border": "200 15% 88%",
    "--input": "200 15% 88%",
    "--ring": "200 70% 50%",
  },
  ocean: {
    "--background": "210 50% 98%",
    "--foreground": "210 20% 15%",
    "--card": "210 40% 99%",
    "--card-foreground": "210 20% 15%",
    "--primary": "210 90% 55%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "210 30% 92%",
    "--secondary-foreground": "210 20% 15%",
    "--muted": "210 30% 92%",
    "--muted-foreground": "210 15% 45%",
    "--accent": "190 85% 50%",
    "--accent-foreground": "0 0% 100%",
    "--border": "210 30% 90%",
    "--input": "210 30% 90%",
    "--ring": "210 90% 55%",
  },
  forest: {
    "--background": "140 30% 97%",
    "--foreground": "140 25% 15%",
    "--card": "140 25% 99%",
    "--card-foreground": "140 25% 15%",
    "--primary": "140 60% 45%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "140 20% 92%",
    "--secondary-foreground": "140 25% 15%",
    "--muted": "140 20% 92%",
    "--muted-foreground": "140 15% 45%",
    "--accent": "100 70% 55%",
    "--accent-foreground": "0 0% 100%",
    "--border": "140 20% 88%",
    "--input": "140 20% 88%",
    "--ring": "140 60% 45%",
  },
  sunset: {
    "--background": "20 40% 98%",
    "--foreground": "20 20% 15%",
    "--card": "20 30% 99%",
    "--card-foreground": "20 20% 15%",
    "--primary": "20 90% 55%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "20 25% 92%",
    "--secondary-foreground": "20 20% 15%",
    "--muted": "20 25% 92%",
    "--muted-foreground": "20 15% 45%",
    "--accent": "340 80% 60%",
    "--accent-foreground": "0 0% 100%",
    "--border": "20 25% 88%",
    "--input": "20 25% 88%",
    "--ring": "20 90% 55%",
  },
  lavender: {
    "--background": "270 40% 98%",
    "--foreground": "270 20% 15%",
    "--card": "270 35% 99%",
    "--card-foreground": "270 20% 15%",
    "--primary": "270 70% 60%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "270 25% 93%",
    "--secondary-foreground": "270 20% 15%",
    "--muted": "270 25% 93%",
    "--muted-foreground": "270 15% 45%",
    "--accent": "290 75% 65%",
    "--accent-foreground": "0 0% 100%",
    "--border": "270 25% 90%",
    "--input": "270 25% 90%",
    "--ring": "270 70% 60%",
  },
  midnight: {
    "--background": "220 65% 8%",
    "--foreground": "210 40% 98%",
    "--card": "220 50% 12%",
    "--card-foreground": "210 40% 98%",
    "--primary": "210 95% 55%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "220 30% 18%",
    "--secondary-foreground": "210 40% 98%",
    "--muted": "220 30% 18%",
    "--muted-foreground": "215 20% 65%",
    "--accent": "190 90% 50%",
    "--accent-foreground": "220 65% 8%",
    "--border": "220 30% 18%",
    "--input": "220 30% 18%",
    "--ring": "210 95% 55%",
  },
  charcoal: {
    "--background": "0 0% 10%",
    "--foreground": "0 0% 98%",
    "--card": "0 0% 14%",
    "--card-foreground": "0 0% 98%",
    "--primary": "200 80% 50%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "0 0% 20%",
    "--secondary-foreground": "0 0% 98%",
    "--muted": "0 0% 20%",
    "--muted-foreground": "0 0% 65%",
    "--accent": "180 75% 55%",
    "--accent-foreground": "0 0% 10%",
    "--border": "0 0% 22%",
    "--input": "0 0% 22%",
    "--ring": "200 80% 50%",
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
