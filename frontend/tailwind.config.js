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
        // Deep obsidian-amethyst background and layered surface tokens
        void: {
          950: '#07050e', // deepest canvas
          900: '#0d0a1a', // standard dark bg
          850: '#140f28', // card background
          800: '#1b1435', // elevated cards
          750: '#231b44', // active / hover
          700: '#2e2456', // subtle borders
          600: '#43357b',
          500: '#6351ab',
        },
        // Attention-grabbing high-energy neon accent tokens
        neon: {
          mint: '#00F5D4',     // Electric mint / jade (vitality, active CPU, primary execution)
          mintGlow: '#70FFE9',
          purple: '#A855F7',   // Vivid ultraviolet (kernel intelligence, recovery scoring)
          violet: '#8B5CF6',
          amber: '#FFB800',    // Hyper solar amber (starvation warnings, queue delay)
          gold: '#F59E0B',
          coral: '#FF3366',    // Hot neon coral (critical anomalies, memory pressure)
          rose: '#F43F5E',
          cyan: '#00E5FF',     // Vivid aqua ice (telemetry metrics, clock ticks)
        },
        // Backwards compatibility mappings upgraded to radiant attention-grabbing colors
        guardian: {
          950: '#07050e',
          900: '#0d0a1a',
          850: '#140f28',
          800: '#1b1435',
          700: '#2e2456',
          600: '#43357b',
          500: '#6351ab',
          cyan: '#00F5D4',     // upgraded to electric mint/teal
          cyanGlow: '#70FFE9',
          emerald: '#00F5D4',
          amber: '#FFB800',
          rose: '#FF3366',
        }
      },
      boxShadow: {
        'neon-mint': '0 0 20px -3px rgba(0, 245, 212, 0.35)',
        'neon-purple': '0 0 20px -3px rgba(168, 85, 247, 0.35)',
        'neon-amber': '0 0 20px -3px rgba(255, 184, 0, 0.35)',
        'neon-coral': '0 0 20px -3px rgba(255, 51, 102, 0.35)',
      }
    },
  },
  plugins: [],
}
