/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom': {
          'bg': '#FFFFFF',
          'text-primary': '#000000',
          'text-secondary': '#666666',
          'border': '#E5E7EB',
          'hover': '#F5F5F5',
        },
      },
    },
  },
  plugins: [],
};
