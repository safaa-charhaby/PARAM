/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepBlue: {
          DEFAULT: '#1D4ED8',
          2: '#1E3A8A',
          3: '#2563EB',
        },
        magenta: {
          DEFAULT: '#D946EF',
          h: '#C026D3',
          l: '#FDF4FF',
        },
        cyan: '#06B6D4',
        yellowVibrant: '#FACC15',
        blue: '#2563eb',
        bg: {
          DEFAULT: '#f8fafc',
          2: '#f1f5f9'
        },
        border: {
          DEFAULT: '#e2e8f0',
          2: '#cbd5e1'
        },
        text: {
          DEFAULT: '#1E3A8A',
          2: '#475569',
          3: '#94a3b8'
        },
        green: '#22c55e',
        red: '#ef4444',
        amber: '#f59e0b',
        purple: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        'r': '10px',
        'r-lg': '16px',
      }
    },
  },
  plugins: [],
}
