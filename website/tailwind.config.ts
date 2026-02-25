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
        navy: {
          DEFAULT: '#0a0a0a',
          surface: '#141414',
          border: '#2a2a2a',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c97e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#8a8a8a',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
export default config
