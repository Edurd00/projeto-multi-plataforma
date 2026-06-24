/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, #3b82f6)',
        secondary: 'var(--color-secondary, #1e3a8a)',
        lojaPrimaria: 'var(--cor-primaria, #3b82f6)',
        lojaSecundaria: 'var(--cor-secondary, #1e3a8a)',
      }
    },
  },
  plugins: [],
}
