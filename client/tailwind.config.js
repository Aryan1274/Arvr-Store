/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)', 
        'primary-hover': 'var(--primary-hover)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'bg-main': 'var(--bg-main)',
        'bg-card': 'var(--bg-card)',
        'border-theme': 'var(--border-color)',
      }
    },
  },
  plugins: [],
}
