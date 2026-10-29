import type { Config } from 'tailwindcss';

const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        bg: withAlpha('--bg'),
        surface: withAlpha('--surface'),
        'surface-2': withAlpha('--surface-2'),
        ink: withAlpha('--ink'),
        fg: withAlpha('--fg'),
        muted: withAlpha('--muted'),
        line: withAlpha('--line'),
        lime: withAlpha('--lime'),
        pink: withAlpha('--pink'),
        violet: withAlpha('--violet'),
        tangerine: withAlpha('--tangerine'),
        sky: withAlpha('--sky'),
        sun: withAlpha('--sun'),
        danger: withAlpha('--danger'),
        success: withAlpha('--success'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        brutal: '4px 4px 0 0 rgb(var(--shadow))',
        'brutal-sm': '2px 2px 0 0 rgb(var(--shadow))',
        'brutal-lg': '8px 8px 0 0 rgb(var(--shadow))',
        glow: '0 0 0 1px rgb(var(--lime) / .4), 0 10px 40px -10px rgb(var(--lime) / .45)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0) rotate(var(--r,0deg))' }, '50%': { transform: 'translateY(-14px) rotate(var(--r,0deg))' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px,20px) scale(.95)' },
        },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 30s) linear infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 14s linear infinite',
        blob: 'blob 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
