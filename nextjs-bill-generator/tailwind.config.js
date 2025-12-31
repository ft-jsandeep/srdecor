/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Light theme colors
        light: {
          bg: '#faf9f7',
          surface: '#f5f3f0',
          card: '#ffffff',
          text: '#2c2c2c',
          textMuted: '#6b6b6b',
          border: '#e5e3e0',
          accent: '#d4a574',
        },
        // Dark theme colors
        dark: {
          bg: '#1a1816',
          surface: '#252320',
          card: '#2e2b28',
          text: '#f5f3f0',
          textMuted: '#a8a5a0',
          border: '#3a3734',
          accent: '#c9a066',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
