import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 1. Initialize State
  const [theme, setTheme] = useState(() => {
    // Check if running in browser
    if (typeof window !== "undefined") {
      // Check Local Storage first
      const savedTheme = localStorage.getItem("app-theme");
      if (savedTheme) {
        return savedTheme;
      }
      // Fallback to System Preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    // Default to light if nothing matches
    return "light";
  });

  // 2. Apply Theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both to avoid conflicts
    root.classList.remove("light", "dark");
    
    // Add the active theme class
    root.classList.add(theme);
    
    // Save preference
    localStorage.setItem("app-theme", theme);
    
    // Optional: Log for debugging (you asked for logs!)
    console.log(`[ThemeContext] Theme applied: ${theme}`);
  }, [theme]);

  // 3. Toggle Function
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 4. Custom Hook for easy access
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}