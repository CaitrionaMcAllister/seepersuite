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
          bg:      'var(--seeper-bg)',
          surface: 'var(--seeper-surface)',
          raised:  'var(--seeper-raised)',
          border:  'var(--seeper-border)',
          muted:   'var(--seeper-muted)',
          steel:   'var(--seeper-steel)',
          white:   'var(--seeper-white)',
        },
        plasma:  { DEFAULT: '#ED693A', glow: 'rgba(237,105,58,0.15)' },
        volt:    { DEFAULT: '#EDDE5C' },
        quantum: { DEFAULT: '#B0A9CF' },
        fern:    { DEFAULT: '#8ACB8F' },
        circuit: { DEFAULT: '#DCFEAD' },
        mossy:   { DEFAULT: '#DDDDCE' },

        // CSS var aliases — update with theme
        bg:      'var(--color-bg)',
        surface: 'var(--color-surface)',
        raised:  'var(--color-raised)',
        text:    'var(--color-text)',
        subtext: 'var(--color-subtext)',
        muted:   'var(--color-muted)',

        // Section colours
        'section-news':      'var(--color-news)',
        'section-wiki':      'var(--color-wiki)',
        'section-tools':     'var(--color-tools)',
        'section-resources': 'var(--color-resources)',
        'section-prompts':   'var(--color-prompts)',
        'section-inside':    'var(--color-inside)',
        'section-us':        'var(--color-us)',
        'section-labs':      'var(--color-labs)',
        'section-dashboard': 'var(--color-dashboard)',
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
