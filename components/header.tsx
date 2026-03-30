"use client";

import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/85 shadow-header dark:shadow-header-dark dark:bg-background/80"
          : "border-b border-transparent bg-transparent"
      } backdrop-blur-xl backdrop-saturate-150`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 ring-1 ring-green-500/20 dark:bg-green-500/[0.08] dark:ring-green-500/15">
            <span className="text-[18px] leading-none" role="img" aria-label="cricket bat">🏏</span>
            {/* Live dot */}
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
          </div>

          <div>
            <h1 className="text-[17px] font-black tracking-tight text-foreground">
              PakScore
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-green-500/70">
              Pakistan Cricket
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Pakistan flag tag */}
          <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground dark:border-white/[0.07] dark:bg-white/[0.04] sm:flex">
            <span>🇵🇰</span>
            <span>PAK Only</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
