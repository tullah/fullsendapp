"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium 
                transition-colors hover:bg-slate-100 hover:text-slate-900 
                dark:hover:bg-slate-800 dark:hover:text-slate-50 
                focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-slate-400 focus-visible:ring-offset-2 
                disabled:pointer-events-none disabled:opacity-50
                h-10 w-10"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all 
                     dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 
                     transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
} 