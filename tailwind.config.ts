import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color
        navy: {
          DEFAULT: '#0F2A44',
          light: '#1A3A5C',
          dark: '#0A1E32',
          50: '#E8EEF4',
          100: '#D1DDE9',
          200: '#A3BBD3',
          300: '#7599BD',
          400: '#4777A7',
          500: '#0F2A44',
          600: '#0D2439',
          700: '#0A1E32',
          800: '#08172A',
          900: '#051122',
        },
        // Accent color - CTAs only (now navy)
        accent: {
          DEFAULT: '#0F2A44',
          hover: '#1A3A5C',
          light: '#0F2A44',
          50: '#E8EEF4',
          100: '#D1DDE9',
          200: '#A3BBD3',
          300: '#7599BD',
          400: '#4777A7',
          500: '#0F2A44',
          600: '#0D2439',
          700: '#0A1E32',
          800: '#08172A',
          900: '#051122',
        },
        // Background colors
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#D7FFEF',
          muted: '#EEF1F5',
        },
        // Text colors
        text: {
          heading: '#111827',
          body: '#374151',
          muted: '#6B7280',
          disabled: '#9CA3AF',
        },
        // Border colors
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
          muted: '#F3F4F6',
        },
        // Semantic colors
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
        },
        // Legacy support
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      maxWidth: {
        'container': '1200px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
