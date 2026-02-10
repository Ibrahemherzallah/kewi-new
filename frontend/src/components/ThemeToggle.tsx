// src/components/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration issues: wait until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a skeleton icon if you prefer
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="btn-scale" aria-label="Toggle theme">
        {theme === "light" ? (
            <Moon className="h-5 w-5" />
        ) : (
            <Sun className="h-5 w-5" />
        )}
      </Button>
  );
};