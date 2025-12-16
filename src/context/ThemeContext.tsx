import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("wms-theme") as Theme;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        return savedTheme;
      }

      // const systemPrefersDark = window.matchMedia(
      //   "(prefers-color-scheme: dark)"
      // ).matches;
      // return systemPrefersDark ? "dark" : "light";

      // Default to light theme when no saved preference is found
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
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
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
};
