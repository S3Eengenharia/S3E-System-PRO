// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    // 1. OBRIGATÓRIO: Define onde o Tailwind deve procurar pelas classes.
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", 
    ],
    
    // 2. COLE O CONTEÚDO EXTRAÍDO DO SEU HTML AQUI:
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          'brand-s3e': '#0a1a2f',
          'brand-blue': '#3B82F6',
          'brand-blue-light': '#EFF6FF',
          'brand-green': '#10B981',
          'brand-purple': '#8B5CF6',
          'brand-orange': '#F97316',
          'brand-red': '#EF4444',
          'brand-gray': {
            '50': '#F9FAFB',
            '100': '#F3F4F6',
            '200': '#E5E7EB',
            '300': '#D1D5DB',
            '400': '#9CA3AF',
            '500': '#6B7280',
            '600': '#4B5563',
            '700': '#374151',
            '800': '#1F2937',
            '900': '#11182C',
          },
          // Dark Theme Colors
          'dark-bg': '#0F172A', // Slate 950 - Fundo principal dark
          'dark-card': '#1E293B', // Slate 800 - Cards e containers
          'dark-border': '#334155', // Slate 700 - Bordas
          'dark-text': '#F8FAFC', // Slate 50 - Texto principal
          'dark-text-secondary': '#CBD5E1', // Slate 300 - Texto secundário
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
          },
          slideUp: {
            '0%': { 
              transform: 'translateY(20px)',
              opacity: '0'
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: '1'
            }
          },
          scaleIn: {
            '0%': {
              transform: 'scale(0.95)',
              opacity: '0'
            },
            '100%': {
              transform: 'scale(1)',
              opacity: '1'
            }
          }
        },
        animation: {
          fadeIn: 'fadeIn 0.2s ease-out',
          slideUp: 'slideUp 0.3s ease-out',
          scaleIn: 'scaleIn 0.2s ease-out'
        }
      },
    },
    
    // 3. Plugin vazio, mas necessário
    plugins: [],
  }