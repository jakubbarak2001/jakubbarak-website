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
    // Sitemap temporarily disabled due to build issue
    // sitemap({
    //   filter: (page) => !page.includes('/test-'),
    // }),
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
