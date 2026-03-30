import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
        "card-dark": "0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.10)",
        "glow-sm": "0 0 0 1px rgba(34,197,94,0.12), 0 4px 16px rgba(34,197,94,0.12)",
        "glow": "0 0 0 1px rgba(34,197,94,0.18), 0 8px 32px rgba(34,197,94,0.16)",
        "glow-lg": "0 0 0 1px rgba(34,197,94,0.22), 0 16px 48px rgba(34,197,94,0.20)",
        "header": "0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "header-dark": "0 1px 0 rgba(255,255,255,0.04)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.25s ease-out forwards",
        "shimmer": "shimmer 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
