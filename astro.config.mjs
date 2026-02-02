import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';

// Load environment variables
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV || 'development',
  process.cwd(),
  ''
);

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: true,
      apiVersion: '2026-02-02',
    }),
    sitemap({
      // Customize sitemap generation
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Filter out any pages you don't want in the sitemap
      filter: (page) => !page.includes('/test-'),
      // Custom serialization for specific pages
      serialize: (item) => {
        // Boost priority for main pages
        if (item.url.endsWith('/')) {
          item.priority = 1.0;
        } else if (item.url.includes('/blog/') && !item.url.endsWith('/blog/')) {
          // Blog posts
          item.changefreq = 'monthly';
          item.priority = 0.8;
        } else if (item.url.includes('/blog') || item.url.includes('/about')) {
          // Main sections
          item.priority = 0.9;
        }
        return item;
      },
    }),
  ],
  site: 'https://jakubbarak.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  // Image optimization settings
  image: {
    // Enable image optimization service
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
    // Configure remote image domains (Sanity CDN)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  // Vite configuration for dependency optimization
  vite: {
    optimizeDeps: {
      include: ['tslib'],
    },
  },
});
