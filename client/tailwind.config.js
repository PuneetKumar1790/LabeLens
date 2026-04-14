export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080808',
        surface: '#0F0F0F',
        border: '#1E1E1E',
        accent: '#D4F53C',
        'accent-dim': '#8FAF1A',
        'text-1': '#EDEDED',
        'text-2': '#6B6B6B',
        'text-3': '#3A3A3A',
        score: {
          bad: '#FF4545',
          mid: '#F5A524',
          good: '#4ADE80',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        syne: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #1E1E1E 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-32': '32px 32px',
      },
    },
  },
  plugins: [],
}
