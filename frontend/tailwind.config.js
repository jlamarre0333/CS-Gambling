/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CS:GO inspired dark theme
        'gaming': {
          'dark': '#0A0E1A',
          'darker': '#070B14',
          'card': '#1A1F2E',
          'border': '#2A3441',
          'hover': '#232938',
        },
        'neon': {
          'blue': '#00D4FF',
          'purple': '#8B5FBF',
          'green': '#00FF88',
          'orange': '#FF6B35',
          'red': '#FF3366',
          'yellow': '#FFD700',
        },
        'accent': {
          'primary': '#00D4FF',
          'secondary': '#8B5FBF',
          'success': '#00FF88',
          'warning': '#FFD700',
          'danger': '#FF3366',
        }
      },
      fontFamily: {
        'gaming': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 95, 191, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'gaming': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { textShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-gaming': 'linear-gradient(135deg, #0A0E1A 0%, #1A1F2E 50%, #2A3441 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00D4FF 0%, #8B5FBF 100%)',
      },
    },
  },
  plugins: [],
} 