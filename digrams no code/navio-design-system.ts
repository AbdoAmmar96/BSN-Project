// ============================================================
// NAVIO DESIGN SYSTEM — tailwind.config.ts
// Extracted from actual Figma screens
// Copy this entire file to your project root
// ============================================================

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── COLORS ──────────────────────────────────────────────
      colors: {
        navio: {
          // Primary — Sunset Orange (main CTA, logo, highlights)
          primary: {
            DEFAULT: '#E8693C',
            hover:   '#D45A2E',
            light:   '#FEF0EA',
            50:      '#FEF0EA',
            100:     '#FCDCCC',
            200:     '#F9C0A4',
            300:     '#F5A07B',
            400:     '#F07A52',
            500:     '#E8693C',
            600:     '#D45A2E',
            700:     '#B04520',
            800:     '#8C3318',
            900:     '#5E1F0C',
          },
          // Amber — Credits, rewards, accents
          amber: {
            DEFAULT: '#F5A623',
            light:   '#FFF7ED',
            50:      '#FFF7ED',
            500:     '#F5A623',
            600:     '#D4880F',
          },
          // Backgrounds
          warm:    '#FDFAF7',   // Main light bg
          surface: '#F5F0EB',   // Cards, sections
          dark:    '#1C1410',   // Dark mode bg
          darker:  '#2A1F18',   // Dark mode cards

          // Semantic
          verified: '#27A96C',  // Verified badges, success
          trust:    '#2D6BE4',  // Links, info, trust elements
          alert:    '#E24B4A',  // Errors, sold out

          // Neutral
          border:  '#EDE8E2',
          muted:   '#6B7280',
          subtle:  '#9CA3AF',
        }
      },

      // ── TYPOGRAPHY ──────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Navio scale
        'navio-xs':   ['10px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'navio-sm':   ['12px', { lineHeight: '1.5' }],
        'navio-base': ['14px', { lineHeight: '1.6' }],
        'navio-md':   ['16px', { lineHeight: '1.6' }],
        'navio-lg':   ['18px', { lineHeight: '1.4' }],
        'navio-xl':   ['22px', { lineHeight: '1.3' }],
        'navio-2xl':  ['28px', { lineHeight: '1.2' }],
        'navio-3xl':  ['36px', { lineHeight: '1.15' }],
        'navio-hero': ['48px', { lineHeight: '1.1' }],
      },

      // ── SPACING ─────────────────────────────────────────────
      // Base unit: 4px
      spacing: {
        '0.5': '2px',
        '1':   '4px',
        '2':   '8px',
        '3':   '12px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '8':   '32px',
        '10':  '40px',
        '12':  '48px',
        '16':  '64px',
        '20':  '80px',
        '24':  '96px',
      },

      // ── BORDER RADIUS ───────────────────────────────────────
      borderRadius: {
        'none':  '0',
        'sm':    '6px',    // Small elements
        'md':    '8px',    // Inputs, checkboxes
        'DEFAULT': '10px', // Buttons, small cards
        'lg':    '12px',   // Cards, modals
        'xl':    '14px',   // Destination cards
        '2xl':   '16px',   // Large cards, panels
        'pill':  '999px',  // Pills, badges, toggles
        'full':  '9999px',
      },

      // ── SHADOWS ─────────────────────────────────────────────
      // Navio uses flat design — minimal shadows
      boxShadow: {
        'none':  'none',
        'card':  '0 1px 3px rgba(28, 20, 16, 0.06)',
        'focus': '0 0 0 3px rgba(232, 105, 60, 0.25)',
        'focus-blue': '0 0 0 3px rgba(45, 107, 228, 0.25)',
      },

      // ── BORDER WIDTH ────────────────────────────────────────
      borderWidth: {
        DEFAULT: '0.5px',
        '0': '0',
        '1': '1px',
        '1.5': '1.5px',
        '2': '2px',
      },

      // ── ANIMATIONS ──────────────────────────────────────────
      transitionDuration: {
        DEFAULT: '150ms',
        'fast': '100ms',
        'slow': '300ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'credits-pop': 'creditsPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        creditsPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config


// ============================================================
// NAVIO GLOBAL CSS — src/app/globals.css
// Add this after @tailwind directives
// ============================================================

/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --navio-primary: #E8693C;
    --navio-primary-hover: #D45A2E;
    --navio-primary-light: #FEF0EA;
    --navio-amber: #F5A623;
    --navio-amber-light: #FFF7ED;
    --navio-warm: #FDFAF7;
    --navio-surface: #F5F0EB;
    --navio-dark: #1C1410;
    --navio-verified: #27A96C;
    --navio-verified-light: #ECFDF5;
    --navio-trust: #2D6BE4;
    --navio-trust-light: #EFF6FF;
    --navio-alert: #E24B4A;
    --navio-alert-light: #FEF2F2;
    --navio-border: #EDE8E2;
    --navio-muted: #6B7280;
  }

  html { font-family: 'Inter', system-ui, sans-serif; }
  body { background-color: var(--navio-warm); color: var(--navio-dark); }
}

@layer components {

  // ── BUTTONS ─────────────────────────────────────────────
  .btn {
    @apply inline-flex items-center justify-center gap-1.5
           rounded-pill font-medium transition-all duration-150
           cursor-pointer select-none whitespace-nowrap;
  }
  .btn-primary {
    @apply btn bg-navio-primary text-white px-7 py-3
           hover:bg-navio-primary-hover active:scale-95;
  }
  .btn-outline {
    @apply btn bg-transparent text-navio-primary border border-1.5 border-navio-primary
           px-7 py-3 hover:bg-navio-primary-light active:scale-95;
  }
  .btn-ghost {
    @apply btn bg-white text-gray-600 border border-DEFAULT border-navio-border
           px-5 py-3 hover:bg-navio-surface active:scale-95;
  }
  .btn-danger {
    @apply btn bg-navio-alert text-white px-7 py-3
           hover:bg-red-600 active:scale-95;
  }
  .btn-sm  { @apply text-navio-sm px-4 py-1.5; }
  .btn-lg  { @apply text-navio-md px-9 py-4; }
  .btn-full { @apply w-full flex; }
  .btn-icon {
    @apply w-9 h-9 rounded-full bg-white border border-DEFAULT border-navio-border
           text-gray-500 inline-flex items-center justify-center cursor-pointer
           hover:border-navio-primary hover:text-navio-primary transition-all;
  }

  // ── BADGES ──────────────────────────────────────────────
  .badge {
    @apply inline-flex items-center gap-1 text-navio-xs font-medium
           px-2.5 py-0.5 rounded-pill;
  }
  .badge-verified  { @apply badge bg-navio-verified-light text-green-800; }
  .badge-primary   { @apply badge bg-navio-primary-light text-orange-800; }
  .badge-business  { @apply badge bg-navio-trust-light text-blue-800; }
  .badge-family    { @apply badge bg-green-50 text-green-800; }
  .badge-solo      { @apply badge bg-purple-50 text-purple-800; }
  .badge-amber     { @apply badge bg-navio-amber-light text-yellow-800; }
  .badge-gray      { @apply badge bg-gray-100 text-gray-600 border border-DEFAULT border-navio-border; }
  .badge-danger    { @apply badge bg-navio-alert-light text-red-800; }

  // ── PILLS (traveler type selector) ──────────────────────
  .pill {
    @apply inline-flex items-center gap-1.5 px-4 py-1.5 rounded-pill
           text-navio-sm font-medium cursor-pointer transition-all
           border border-1.5 border-navio-border text-gray-500 bg-white
           hover:border-navio-primary hover:text-navio-primary;
  }
  .pill-active {
    @apply bg-navio-primary text-white border-navio-primary
           hover:bg-navio-primary-hover hover:text-white;
  }

  // ── INPUTS ──────────────────────────────────────────────
  .inp-label {
    @apply text-navio-xs font-medium text-gray-500
           uppercase tracking-wide mb-1 block;
  }
  .inp {
    @apply w-full bg-navio-primary-light border border-1 border-navio-border
           rounded-DEFAULT px-3.5 py-2.5 text-navio-base text-navio-dark
           outline-none transition-all placeholder:text-gray-400
           focus:border-navio-primary focus:bg-white focus:shadow-focus;
  }
  .inp-error {
    @apply border-navio-alert bg-navio-alert-light
           focus:border-navio-alert focus:shadow-none;
  }
  .inp-hint       { @apply text-navio-xs text-gray-400 mt-1; }
  .inp-hint-error { @apply text-navio-xs text-navio-alert mt-1; }

  // ── CARDS ───────────────────────────────────────────────
  .card {
    @apply bg-white rounded-2xl border border-DEFAULT border-navio-border p-4;
  }
  .card-hover {
    @apply card transition-all cursor-pointer
           hover:border-navio-primary hover:shadow-card;
  }
  .dest-card {
    @apply bg-white rounded-xl border border-DEFAULT border-navio-border
           overflow-hidden cursor-pointer transition-all hover:shadow-card;
  }

  // ── NAVBAR ──────────────────────────────────────────────
  .navbar {
    @apply fixed top-0 left-0 right-0 z-50 bg-white
           border-b border-DEFAULT border-navio-border
           px-5 h-14 flex items-center justify-between;
  }
  .nav-logo {
    @apply text-navio-xl font-medium text-navio-primary;
  }
  .nav-link {
    @apply text-navio-base text-gray-500 cursor-pointer
           hover:text-navio-primary transition-colors;
  }
  .nav-link-active {
    @apply text-navio-primary font-medium;
  }

  // ── SEARCH BAR ──────────────────────────────────────────
  .search-bar {
    @apply bg-white border border-DEFAULT border-navio-border
           rounded-pill flex items-center overflow-hidden;
  }
  .search-field {
    @apply flex-1 flex items-center gap-2 px-4 py-2.5
           border-r border-DEFAULT border-navio-border;
  }
  .search-btn {
    @apply w-11 h-11 bg-navio-primary rounded-full m-1 flex items-center
           justify-content-center cursor-pointer hover:bg-navio-primary-hover
           transition-colors flex-shrink-0;
  }

  // ── PRICE BREAKDOWN ─────────────────────────────────────
  .price-row {
    @apply flex justify-between items-center py-1.5 text-navio-sm
           border-b border-DEFAULT border-navio-border last:border-0
           last:font-medium last:text-navio-md last:text-navio-primary;
  }

  // ── CREDITS BANNER ──────────────────────────────────────
  .credits-banner {
    @apply bg-navio-amber-light border border-DEFAULT border-yellow-200
           rounded-lg p-3.5 flex items-start gap-3;
  }
  .credits-icon {
    @apply w-9 h-9 bg-navio-amber rounded-lg flex items-center
           justify-center text-base flex-shrink-0;
  }

  // ── STAR RATING ─────────────────────────────────────────
  .star-filled { @apply text-navio-amber; }
  .star-empty  { @apply text-navio-border; }

  // ── TOGGLE ──────────────────────────────────────────────
  .toggle-input:checked + label .toggle-track {
    @apply bg-navio-primary;
  }

  // ── VERIFIED BADGE WITH DOT ──────────────────────────────
  .badge-dot::before {
    content: '';
    @apply inline-block w-1.5 h-1.5 rounded-full bg-current mr-1;
  }

}

@layer utilities {
  .text-gradient-primary {
    background: linear-gradient(135deg, #E8693C, #F5A623);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
*/
