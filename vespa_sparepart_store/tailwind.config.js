export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#121110',
        surface: '#1B1917',
        'surface-alt': '#221F1B',
        border: '#2E2A24',
        ink: '#EBE5D9',
        muted: '#9A9184',
        brass: {
          DEFAULT: '#C08A3E',
          light: '#D6A55F',
          dark: '#96682B'
        },
        teal: {
          DEFAULT: '#6E8478',
          light: '#8AA192'
        },
        danger: '#B5544C',
        success: '#6E9169'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
