export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#16201e',
        muted: '#6b756f',
        paper: '#f4f1ea',
        card: '#fffefb',
        line: '#e5dfd2',
        brand: {
          DEFAULT: '#14766a',
          dark: '#0d5a50',
          soft: '#e1f0ed'
        }
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(28px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        slide: 'slide 0.22s ease-out',
        fade: 'fade 0.2s ease-out'
      }
    }
  },
  plugins: []
}
