/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 30px 80px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
