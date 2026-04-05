/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFCE00',
          magenta: '#E6007E',
          blue: '#1D4ED8',
          cyan: '#00AEEF',
          dark: '#0F172A',
        },
        navy: {
          DEFAULT: '#0F172A', // Darker blue for text/nav
          2: '#1e293b',
          3: '#334155',
        },
        orange: {
          DEFAULT: '#E6007E', // Magenta is the new primary
          h: '#d10074',
          l: '#fff1f8',
        },
        blue: '#1D4ED8',
        teal: '#00AEEF',
        bg: {
          DEFAULT: '#f8fafc',
          2: '#f1f5f9'
        },
        border: {
          DEFAULT: '#e2e8f0',
          2: '#cbd5e1'
        },
        text: {
          DEFAULT: '#0F172A',
          2: '#475569',
          3: '#94a3b8'
        },
        green: '#10b981',
        red: '#ef4444',
        amber: '#FFCE00',
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
