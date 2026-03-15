/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5'
        },
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}
