/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Heebo', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // משטחים כהים
        bg: '#060912',
        surface: '#0c1322',
        surface2: '#111b30',
        line: '#1c2742',
        // אקסנט ראשי - ציאן ניאון
        brand: {
          50: '#ecfeff',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        accent: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        ink: {
          50: '#e2e8f0',
          100: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.15), 0 0 32px -8px rgba(34,211,238,0.35)',
        'glow-violet': '0 0 0 1px rgba(168,85,247,0.18), 0 0 32px -8px rgba(168,85,247,0.4)',
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 40px -20px rgba(0,0,0,0.8)',
      },
      borderRadius: {
        '2xl': '1.1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'grid-dots':
          'radial-gradient(rgba(148,163,184,0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
