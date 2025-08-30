/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Dark gradient theme colors
        primary: {
          50: '#fef7ee',
          100: '#fdf0e1',
          200: '#fbb678',
          300: '#f59e0b',
          400: '#d97706',
          500: '#b45309',
          600: '#92400e',
          700: '#78350f',
          800: '#63281a',
          900: '#51261a',
          950: '#2d130e',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        gold: {
          50: '#fefdf7',
          100: '#fdf8e8',
          200: '#faf0c5',
          300: '#f5e297',
          400: '#eecf67',
          500: '#e6b84a',
          600: '#d19d3e',
          700: '#ae7c35',
          800: '#8e6132',
          900: '#744f2b',
        },
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          blue: '#06b6d4',
          green: '#10b981',
        }
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
        'gold-gradient': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)',
        'peek-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #f59e0b 70%, #d97706 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(230, 184, 74, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(230, 184, 74, 0.8)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.8)',
            transform: 'scale(1.02)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
