import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gotham: ['var(--font-gotham)', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#f9f5eb',
          200: '#f0e6d2',
          300: '#e6d7b8',
          400: '#d4b896',
          500: '#c19a6b',
          600: '#a07c4d',
          700: '#7f6239',
          800: '#5e492b',
          900: '#3d301c',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
      },
    },
  },
  plugins: [],
};
export default config;
