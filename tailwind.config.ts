import type { Config } from "tailwindcss"
import { tailwindColors, theme } from "./lib/theme/colors"

const config = {
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
        // Colores de la marca
        brand: tailwindColors.brand,
        
        // Colores del sistema basados en la marca
        border: theme.colors.border.default,
        input: theme.colors.border.default,
        ring: theme.colors.primary.green,
        background: theme.colors.background.primary,
        foreground: theme.colors.text.primary,
        
        // Colores principales
        primary: {
          DEFAULT: theme.colors.primary.green,
          foreground: theme.colors.text.inverse,
        },
        secondary: {
          DEFAULT: theme.colors.primary.mediumBlue,
          foreground: theme.colors.text.inverse,
        },
        destructive: {
          DEFAULT: theme.colors.status.error,
          foreground: theme.colors.text.inverse,
        },
        muted: {
          DEFAULT: theme.colors.gray[100],
          foreground: theme.colors.text.secondary,
        },
        accent: {
          DEFAULT: theme.colors.primary.yellow,
          foreground: theme.colors.primary.darkBlue,
        },
        popover: {
          DEFAULT: theme.colors.background.primary,
          foreground: theme.colors.text.primary,
        },
        card: {
          DEFAULT: theme.colors.background.primary,
          foreground: theme.colors.text.primary,
        },
        
        // Escala de grises
        gray: theme.colors.gray,
        
        // Colores de estado
        success: theme.colors.status.success,
        warning: theme.colors.status.warning,
        error: theme.colors.status.error,
        info: theme.colors.status.info,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
