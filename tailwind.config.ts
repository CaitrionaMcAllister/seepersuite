import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        seeper: {
          black:   '#000000',
          bg:      '#0d0d0d',
          surface: '#222222',
          raised:  '#2a2a2a',
          border:  '#3a3a3a',
          muted:   '#626262',
          steel:   '#C3C3C3',
          white:   '#FFFFFF',
        },
        plasma:  { DEFAULT: '#ED693A', glow: 'rgba(237,105,58,0.15)' },
        volt:    { DEFAULT: '#EDDE5C' },
        quantum: { DEFAULT: '#B0A9CF' },
        fern:    { DEFAULT: '#8ACB8F' },
        circuit: { DEFAULT: '#DCFEAD' },
        mossy:   { DEFAULT: '#DDDDCE' },
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(237,105,58,0.2)',
        'glow-purple': '0 0 20px rgba(176,169,207,0.2)',
        card:          '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
