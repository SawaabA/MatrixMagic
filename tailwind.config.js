/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        // Light theme
        light: {
          bg: '#fefefe',
          surface: '#ffffff',
          border: '#e5e7eb',
          text: '#1f2937',
          muted: '#6b7280',
          accent: '#3b82f6',
        },
        // Dark theme
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: '#f1f5f9',
          muted: '#94a3b8',
          accent: '#60a5fa',
        },
        // Warm theme
        warm: {
          bg: '#fefaf6',
          surface: '#fff8f0',
          border: '#f3e8d8',
          text: '#7c2d12',
          muted: '#9a5a3a',
          accent: '#ea580c',
        },
        // High contrast theme
        contrast: {
          bg: '#000000',
          surface: '#1a1a1a',
          border: '#404040',
          text: '#ffffff',
          muted: '#cccccc',
          accent: '#ffff00',
        },
        // Matrix Magic brand colors
        magic: {
          50: '#fef7ff',
          100: '#fdeeff',
          200: '#fbd5ff',
          300: '#f8b3ff',
          400: '#f281ff',
          500: '#e94dff',
          600: '#d425e7',
          700: '#b018c3',
          800: '#91169f',
          900: '#771682',
        },
        // Warm accent colors
        warmAccent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
          '40%, 43%': { transform: 'translateY(-8px)' },
          '70%': { transform: 'translateY(-4px)' },
          '90%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
};