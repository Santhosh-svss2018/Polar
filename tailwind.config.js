/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polar: {
          950: '#070D1B',
          900: '#0B132B',
          850: '#0F1A38',
          800: '#142245',
          750: '#1A2C56',
          700: '#21376A',
          600: '#2C498A',
          500: '#3D63B8',
          cyan: '#00E5FF',
          ice: '#48CAE4',
          teal: '#00C9A7',
          amber: '#FFB300',
          crimson: '#FF3D71',
          border: '#1E325A',
          'border-light': '#2A4374',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
