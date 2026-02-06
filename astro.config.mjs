import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
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
  },
  // Vite configuration for dependency optimization
  vite: {
    optimizeDeps: {
      include: ['tslib'],
    },
  },
});
