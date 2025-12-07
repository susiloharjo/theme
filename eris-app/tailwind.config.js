/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: 'var(--color-primary)',
          600: '#0284c7', // approximation
          700: '#0369a1',
          800: '#075985',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          50: '#f0fdf9',
          100: '#ccfbf1',
          500: 'var(--color-secondary)',
          600: '#0d9488',
          700: '#0f766e',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          50: '#f0fdf4',
          100: '#dcfce7',
          500: 'var(--color-success)',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          50: '#fefce8',
          100: '#fef9c3',
          500: 'var(--color-warning)',
          600: '#ca8a04',
          700: '#a16207',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          50: '#fef2f2',
          100: '#fee2e2',
          500: 'var(--color-error)',
          600: '#dc2626',
          700: '#b91c1c',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      }
    },
  },
  plugins: [],
}
