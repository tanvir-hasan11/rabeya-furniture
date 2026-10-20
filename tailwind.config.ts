import type { Config } from "tailwindcss";

// Generated from replica/design/tokens.json — keep the two in sync.
// Components must use these semantic names, never raw hex.

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: { DEFAULT: "#f6f6f4", 2: "#efeeea" },
        border: { DEFAULT: "#e3e2dd", input: "#6b7280" },
        text: { DEFAULT: "#16161a", muted: "#5b5b66" },
        primary: { DEFAULT: "#3a3a40", on: "#ffffff" },
        secondary: { DEFAULT: "#52525b", on: "#ffffff" },
        accent: { DEFAULT: "#5f5f6a", on: "#ffffff" },
        danger: { DEFAULT: "#a52626", tint: "#f6e9e9" },
        success: { DEFAULT: "#1a6a43", tint: "#e9f2ed" },
        warning: { DEFAULT: "#92400e", tint: "#f4ece7" },
        whatsapp: { DEFAULT: "#25d366", on: "#04331a" },
      },
      fontFamily: {
        sans: ["var(--font-sans-src)", "Inter", "Hind Siliguri", "system-ui", "sans-serif"],
        bangla: ["var(--font-bangla-src)", "Hind Siliguri", "Noto Sans Bengali", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.02em" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "26px" }],
        lg: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        xl: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "2xl": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        display: ["36px", { lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.01em" }],
      },
      spacing: {
        0: "0px", 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px",
        6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px",
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px", pill: "999px" },
      boxShadow: {
        sm: "0 1px 2px rgba(22,22,26,.05)",
        card: "0 1px 2px rgba(22,22,26,.06), 0 4px 12px rgba(22,22,26,.08)",
        pop: "0 12px 32px rgba(22,22,26,.16)",
      },
      transitionDuration: { fast: "120ms", base: "200ms", slow: "300ms" },
      transitionTimingFunction: { token: "cubic-bezier(.2,.8,.2,1)" },
      maxWidth: { content: "1200px" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    },
  },
  plugins: [],
};

export default config;
