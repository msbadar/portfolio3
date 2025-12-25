/**
 * PostCSS Configuration for Tailwind CSS v4
 *
 * Tailwind CSS v4 uses a single PostCSS plugin that handles everything:
 * - CSS parsing and processing
 * - Utility class generation
 * - Theme configuration from @theme directive
 * - Production optimizations
 *
 * Next.js automatically adds:
 * - autoprefixer (browser compatibility)
 * - cssnano (production minification)
 */

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
