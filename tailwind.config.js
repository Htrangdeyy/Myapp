/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        "surface-2": v("surface-2"),
        fg: v("fg"),
        muted: v("muted"),
        line: v("line"),
        accent: v("accent"),
        "accent-fg": v("accent-fg"),
        nav: v("nav"),
        "nav-fg": v("nav-fg"),
        ink: v("ink"),
        "ink-soft": v("ink-soft"),
        lavender: v("lavender"),
        sky: v("sky"),
        mint: v("mint"),
        butter: v("butter"),
        peach: v("peach"),
        lilac: v("lilac"),
        danger: v("danger"),
        success: v("success"),
      },
      borderRadius: { xl2: "1.25rem", xl3: "1.75rem" },
      boxShadow: {
        soft: "0 1px 2px rgb(20 20 30 / 0.04), 0 4px 16px rgb(20 20 30 / 0.05)",
        lift: "0 6px 24px rgb(20 20 30 / 0.10)",
      },
      keyframes: {
        pop: { "0%": { transform: "scale(0.6)" }, "60%": { transform: "scale(1.15)" }, "100%": { transform: "scale(1)" } },
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "dialog-in": { from: { opacity: 0, transform: "translateY(8px) scale(0.96)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: {
        pop: "pop 280ms ease-out",
        "fade-in": "fade-in 160ms ease-out",
        "dialog-in": "dialog-in 200ms cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [],
};
