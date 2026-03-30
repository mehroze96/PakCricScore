"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition-all duration-150 hover:border-border hover:bg-muted/60 hover:text-foreground active:scale-95 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
    >
      {mounted ? (
        isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />
      ) : (
        <Sun className="h-3.5 w-3.5 opacity-0" />
      )}
    </button>
  );
}
