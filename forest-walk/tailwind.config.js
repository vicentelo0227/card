/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          dark: '#0a0a0a',
          deep: '#0d1a0d',
          mid: '#1a2f1a',
          light: '#2d4a35',
        },
        gold: {
          muted: '#c8b896',
          warm: '#d4c4a8',
          bright: '#e8d9b8',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Noto Serif TC', 'serif'],
        body: ['Noto Serif TC', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-out': 'fadeOut 0.6s ease-in forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-in forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.5', boxShadow: '0 0 20px rgba(232, 217, 184, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 35px rgba(232, 217, 184, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      transitionDuration: {
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  plugins: [],
}
