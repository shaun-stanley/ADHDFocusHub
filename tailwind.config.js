/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        'elev-1': '0 0.5px 0.5px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.06)',
        'elev-2': '0 1px 1px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)',
      }
    }
  },
  plugins: [],
}
