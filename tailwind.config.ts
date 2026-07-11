import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Rayfin-distillery dark glassmorphism palette. `amber` and `teal` are
        // kept as token names (used throughout components as e.g. `text-amber-900`,
        // `bg-teal-700`) but repointed to the dark theme so every component picks
        // up the new look without a per-file rewrite. `amber` = accent/label tones,
        // `teal` = primary CTA tones (both resolve to the same amber accent family
        // so buttons and active states read as one consistent brand color).
        amber: {
          50: 'rgba(255,255,255,0.05)',
          100: 'rgba(15,23,42,0.8)', // slate-900/80 — inactive pill bg
          200: 'rgba(255,255,255,0.1)', // hairline border
          300: 'rgba(255,255,255,0.15)',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#fbbf24',
          700: 'rgba(148,163,184,0.9)', // slate-400 — secondary text
          800: '#cbd5e1', // slate-300 — body text
          900: '#fcd34d', // bright amber — labels/headings
        },
        teal: {
          50: 'rgba(255,255,255,0.05)',
          100: 'rgba(255,255,255,0.08)',
          200: 'rgba(245,158,11,0.25)',
          500: '#fbbf24',
          600: 'rgba(255,255,255,0.1)',
          700: '#f59e0b', // primary CTA amber
          800: '#d97706', // CTA hover
          900: '#b45309', // CTA active
        },
        success: '#4caf50',
        danger: '#e5484d',
        warn: '#f5a623',
        parchment: '#0a0e16', // near-black base — also doubles as dark text-on-amber-pill color
        ink: '#e2e8f0', // light slate — body text on the dark background
      },
      fontFamily: {
        display: ['var(--font-inter)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
