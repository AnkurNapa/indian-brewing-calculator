import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#fdf6ec',
          100: '#f8e8c9',
          200: '#f0d191',
          300: '#e6b355',
          400: '#dd9a2e',
          500: '#c17f1c',
          600: '#9c6316',
          700: '#7a4d15',
          800: '#5e3b15',
          900: '#4a2f13',
        },
        teal: {
          50: '#eefaf7',
          100: '#d3f0e8',
          200: '#a3e0d1',
          300: '#6cc9b6',
          400: '#3ea997',
          500: '#28897b',
          600: '#1e6d63',
          700: '#1c574f',
          800: '#1a4641',
          900: '#193a37',
        },
        parchment: '#f6efe0',
        ink: '#241d15',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        body: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
