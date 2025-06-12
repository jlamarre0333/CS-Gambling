/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'mobile': {'max': '768px'},
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'wide': '1536px',
        // Mobile-specific breakpoints
        'mobile-sm': {'max': '400px'},
        'mobile-md': {'min': '401px', 'max': '600px'},
        'mobile-lg': {'min': '601px', 'max': '768px'},
        // Orientation-based breakpoints
        'landscape': {'raw': '(orientation: landscape)'},
        'portrait': {'raw': '(orientation: portrait)'},
        // Touch device detection
        'touch': {'raw': '(hover: none) and (pointer: coarse)'},
        'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
      },
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
      fontSize: {
        // Mobile-optimized font sizes
        'mobile-xs': ['0.75rem', '1rem'],
        'mobile-sm': ['0.875rem', '1.25rem'],
        'mobile-base': ['1rem', '1.5rem'],
        'mobile-lg': ['1.125rem', '1.75rem'],
        'mobile-xl': ['1.25rem', '1.75rem'],
        'mobile-2xl': ['1.5rem', '2rem'],
        'mobile-3xl': ['1.875rem', '2.25rem'],
        'mobile-4xl': ['2.25rem', '2.5rem'],
      },
      spacing: {
        // Safe area spacings
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        // Touch target sizes
        'touch-sm': '44px',
        'touch': '48px',
        'touch-lg': '56px',
        // Mobile-specific spacings
        'mobile-1': '0.25rem',
        'mobile-2': '0.5rem',
        'mobile-3': '0.75rem',
        'mobile-4': '1rem',
        'mobile-6': '1.5rem',
        'mobile-8': '2rem',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'mobile-screen': '100svh', // Small viewport height
        'mobile-full': '100dvh',   // Dynamic viewport height
      },
      maxHeight: {
        'mobile-screen': '100svh',
        'mobile-modal': '90vh',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 95, 191, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'gaming': '0 4px 20px rgba(0, 0, 0, 0.5)',
        // Mobile-specific shadows
        'mobile-card': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'mobile-button': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'mobile-floating': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        // Mobile-specific animations
        'mobile-bounce': 'mobile-bounce 0.3s ease-out',
        'mobile-slide-up': 'slide-up 0.4s ease-out',
        'mobile-slide-down': 'slide-down 0.4s ease-out',
        'mobile-fade-in': 'fade-in 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
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
        'mobile-bounce': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
      },
      backgroundImage: {
        'gradient-gaming': 'linear-gradient(135deg, #0A0E1A 0%, #1A1F2E 50%, #2A3441 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00D4FF 0%, #8B5FBF 100%)',
        // Mobile-specific gradients
        'gradient-mobile-dark': 'linear-gradient(180deg, #070B14 0%, #0A0E1A 100%)',
        'gradient-mobile-card': 'linear-gradient(135deg, rgba(26, 31, 46, 0.8) 0%, rgba(42, 52, 65, 0.8) 100%)',
      },
      backdropBlur: {
        'mobile': '8px',
        'mobile-strong': '16px',
      },
      zIndex: {
        'mobile-nav': '50',
        'mobile-modal': '60',
        'mobile-toast': '70',
        'mobile-overlay': '80',
      },
      transitionDuration: {
        '50': '50ms',
        '250': '250ms',
        '400': '400ms',
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      brightness: {
        '85': '.85',
        '90': '.90',
        '115': '1.15',
      },
    },
  },
  plugins: [
    // Custom plugin for mobile utilities
    function({ addUtilities, theme }) {
      const mobileUtilities = {
        '.touch-target': {
          minHeight: theme('spacing.touch'),
          minWidth: theme('spacing.touch'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.mobile-safe-area': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.mobile-safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.mobile-safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.mobile-safe-x': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.mobile-viewport': {
          height: '100vh',
          height: '100dvh', // Dynamic viewport height for mobile
        },
        '.mobile-scroll': {
          '-webkit-overflow-scrolling': 'touch',
          'overscroll-behavior': 'contain',
        },
        '.mobile-no-zoom': {
          fontSize: '16px', // Prevent zoom on input focus in iOS
        },
        '.mobile-haptic': {
          '-webkit-tap-highlight-color': 'transparent',
          '-webkit-touch-callout': 'none',
          '-webkit-user-select': 'none',
          'user-select': 'none',
        },
      }
      
      addUtilities(mobileUtilities)
    }
  ],
} 