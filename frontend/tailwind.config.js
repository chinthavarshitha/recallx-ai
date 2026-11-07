/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: "#080B12",
        graphite: "#111827",
        "graphite-card": "#161F30",
        "graphite-border": "#1E293B",
        cobalt: "#315CFF",
        "cobalt-glow": "#315CFF26",
        lime: "#C6FF4D",
        "lime-glow": "#C6FF4D26",
        pure: "#F8FAFC",
        muted: "#8993A4",
        error: "#FF4D5D",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'cobalt-glow': '0 0 25px -5px rgba(49, 92, 255, 0.3)',
        'lime-glow': '0 0 25px -5px rgba(198, 255, 77, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
