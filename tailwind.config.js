/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#080B16',
          secondary: '#0C1021',
          tertiary: '#10152B',
          light: '#F8FAFC',
        },
        surface: {
          DEFAULT: '#101526',
          elevated: '#151C30',
          highlight: '#1C2540',
          card: 'rgba(16, 21, 38, 0.75)',
          light: '#FFFFFF',
          'light-elevated': '#F1F5F9',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.16)',
          primary: 'rgba(91, 108, 255, 0.3)',
          accent: 'rgba(139, 92, 246, 0.3)',
          'ai-accent': 'rgba(79, 209, 255, 0.3)',
        },
        primary: {
          DEFAULT: '#5B6CFF',
          hover: '#4C5DE6',
          soft: '#7C83FF',
          glow: 'rgba(91, 108, 255, 0.25)',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          soft: '#A78BFA',
          glow: 'rgba(139, 92, 246, 0.25)',
        },
        ai: {
          DEFAULT: '#4FD1FF',
          glow: 'rgba(79, 209, 255, 0.25)',
          dark: '#0284C7',
        },
        commitment: {
          DEFAULT: '#10B981',
          soft: '#34D399',
          glow: 'rgba(16, 185, 129, 0.2)',
        },
        decision: {
          DEFAULT: '#6366F1',
          soft: '#818CF8',
          glow: 'rgba(99, 102, 241, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'wave': 'wave 1.2s ease-in-out infinite',
        'radar': 'radar 4s linear infinite',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(91, 108, 255, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(79, 209, 255, 0.4)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(91, 108, 255, 0.25)',
        'glow-md': '0 0 25px -5px rgba(91, 108, 255, 0.35)',
        'glow-ai': '0 0 25px -5px rgba(79, 209, 255, 0.35)',
        'glow-commitment': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
