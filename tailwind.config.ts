import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#182EC3",
          50: "#F0F2FF",
          100: "#E1E6FF",
          200: "#C8D1FF",
          300: "#A5B4FF",
          400: "#7B8EFF",
          500: "#5B6FFF",
          600: "#4C5EF5",
          700: "#3D4DE1",
          800: "#2F3CB8",
          900: "#182EC3",
          950: "#0F1B7A",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        university: {
          primary: "#182EC3",
          secondary: "#F8F9FF",
          accent: "#FFD700",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          faculty: {
            50: "#F0F9FF",
            100: "#E0F2FE",
            500: "#0EA5E9",
            600: "#0284C7",
            700: "#0369A1",
          },
          department: {
            50: "#F0FDF4",
            100: "#DCFCE7",
            500: "#22C55E",
            600: "#16A34A",
            700: "#15803D",
          },
          status: {
            online: "#10B981",
            offline: "#6B7280",
            active: "#3B82F6",
            inactive: "#9CA3AF",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        university: "12px",
        "university-lg": "16px",
        "university-xl": "20px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.33)" },
          "40%, 50%": { opacity: "1" },
          "100%": { opacity: "0", transform: "scale(1.33)" },
        },
        "recognition-scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "card-hover": {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-4px) scale(1.02)" },
        },
        "stat-counter": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        "tab-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "recognition-scan": "recognition-scan 2s linear infinite",
        "card-hover": "card-hover 0.3s ease-out",
        "stat-counter": "stat-counter 0.6s ease-out",
        "progress-fill": "progress-fill 1.5s ease-out",
        "tab-slide": "tab-slide 0.3s ease-out",
      },
      fontFamily: {
        university: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        university: "0 10px 40px rgba(24, 46, 195, 0.1)",
        "university-lg": "0 20px 60px rgba(24, 46, 195, 0.15)",
        "faculty-card": "0 4px 20px rgba(24, 46, 195, 0.08)",
        "faculty-card-hover": "0 8px 30px rgba(24, 46, 195, 0.15)",
        "stat-card": "0 2px 12px rgba(24, 46, 195, 0.06)",
        "tab-active": "inset 0 -2px 0 0 #182EC3",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
