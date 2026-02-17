import { useState, useEffect, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./useTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("wms-theme") as Theme;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        return savedTheme;
      }
      return "light";
    }
    return "light";
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.add("theme-changing");

    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");

    root.setAttribute("data-theme", theme);
    localStorage.setItem("wms-theme", theme);

    const id = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        root.classList.remove("theme-changing");
      }, 0);
    });

    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev: Theme) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
