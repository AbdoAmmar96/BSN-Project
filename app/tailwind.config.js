/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    // Brand CSS has its own reset — disable Tailwind's preflight to avoid conflicts
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#5C15CC',
          'purple-deep': '#0F0830',
          orange: '#F15A24',
          'orange-deep': '#C73E0F',
          teal: '#65C8D0',
          'teal-deep': '#3FA4AC',
          ink: '#0F0830',
          cream: '#FFF6EE',
          paper: '#FAF3FF',
        },
      },
      fontFamily: {
        display: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        body: ['Tajawal', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '6px 6px 0 #0F0830',
        'brutal-sm': '4px 4px 0 #0F0830',
        'brutal-lg': '10px 10px 0 #0F0830',
        'brutal-orange': '6px 6px 0 #F15A24',
        'brutal-teal': '6px 6px 0 #65C8D0',
        'brutal-purple': '6px 6px 0 #5C15CC',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
