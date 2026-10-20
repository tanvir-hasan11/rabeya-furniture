// Rabeya Furniture — Tailwind theme mapping.
// Merge into tailwind.config.{js,ts} as: theme.extend
// Import the raw token file so values stay in one place.

import tokens from "./tokens.json";

const { color, font, space, radius, shadow, motion, layout } = tokens;

const px = (n) => `${n}px`;
const spaceMap = Object.fromEntries(space.map((v, i) => [i, px(v)]));
const radiusMap = Object.fromEntries(
  Object.entries(radius).map(([k, v]) => [k, px(v)])
);

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: color.bg,
        surface: { DEFAULT: color["surface"], 2: color["surface-2"] },
        border: { DEFAULT: color.border, input: color["border-input"] },
        text: { DEFAULT: color.text, muted: color["text-muted"] },
        primary: { DEFAULT: color.primary, on: color["on-primary"] },
        secondary: { DEFAULT: color.secondary, on: color["on-secondary"] },
        accent: { DEFAULT: color.accent, on: color["on-accent"] },
        danger: color.danger,
        success: color.success,
        warning: color.warning,
        whatsapp: { DEFAULT: color.whatsapp, on: color["on-whatsapp"] },
      },
      fontFamily: {
        sans: font.sans.split(",").map((s) => s.trim().replace(/^'|'$/g, "")),
        bangla: font.bangla.split(",").map((s) => s.trim().replace(/^'|'$/g, "")),
        mono: font.mono.split(",").map((s) => s.trim().replace(/^'|'$/g, "")),
      },
      fontSize: {
        xs: [px(tokens.type.xs.size), { lineHeight: px(tokens.type.xs.line), fontWeight: tokens.type.xs.weight }],
        sm: [px(tokens.type.sm.size), { lineHeight: px(tokens.type.sm.line) }],
        base: [px(tokens.type.base.size), { lineHeight: px(tokens.type.base.line) }],
        lg: [px(tokens.type.lg.size), { lineHeight: px(tokens.type.lg.line), fontWeight: tokens.type.lg.weight }],
        xl: [px(tokens.type.xl.size), { lineHeight: px(tokens.type.xl.line), fontWeight: tokens.type.xl.weight }],
        "2xl": [px(tokens.type["2xl"].size), { lineHeight: px(tokens.type["2xl"].line), fontWeight: tokens.type["2xl"].weight }],
        display: [px(tokens.type.display.size), { lineHeight: px(tokens.type.display.line), fontWeight: tokens.type.display.weight }],
      },
      spacing: spaceMap,
      borderRadius: radiusMap,
      boxShadow: { sm: shadow.sm, card: shadow.card, pop: shadow.pop },
      transitionDuration: { fast: motion.fast, base: motion.base, slow: motion.slow },
      transitionTimingFunction: { token: motion.ease },
      maxWidth: { content: px(layout.maxContent) },
      screens: Object.fromEntries(
        Object.entries(layout.breakpoints).map(([k, v]) => [k, px(v)])
      ),
    },
  },
};
