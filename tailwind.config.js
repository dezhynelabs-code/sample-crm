/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        slate: 'var(--color-slate)',
        mist: 'var(--color-mist)',
        paper: 'var(--color-paper)',
        line: 'var(--color-line)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          subtle: 'var(--color-accent-subtle)',
        },
        status: {
          new: 'var(--status-new)',
          progress: 'var(--status-progress)',
          won: 'var(--status-won)',
          lost: 'var(--status-lost)',
          danger: 'var(--status-danger)',
          'danger-subtle': 'var(--status-danger-subtle)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        drawer: 'var(--shadow-drawer)',
      },
      transitionTimingFunction: {
        base: 'cubic-bezier(0.4, 0, 0.2, 1)',
        panel: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '220ms',
        panel: '300ms',
      },
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
}
