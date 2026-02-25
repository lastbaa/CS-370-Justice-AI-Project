import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0d1117',
          light: '#161b22',
          surface: '#21262d',
          border: '#30363d',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c97e',
          dark: '#a07c30',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"SF Mono"', 'Consolas', 'monospace'],
      }
    }
  },
  plugins: []
}

export default config
