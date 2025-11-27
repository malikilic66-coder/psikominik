/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'psiko-teal': '#3DB6B1',
        'psiko-dark-teal': '#2A8F8B',
        'sun-yellow': '#F9E104',
        'sage-green': '#35D461',
        'soft-coral': '#FF5656',
        'warm-cream': '#FFF8E8',
        'deep-slate': '#2C3E50',
      },
      fontFamily: {
        heading: ['"Fredoka"', '"Outfit"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        alt: ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'card': '0 4px 6px -1px rgba(61, 182, 177, 0.1), 0 2px 4px -1px rgba(61, 182, 177, 0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    }
  },
  plugins: [],
}
