import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Create and export a configured Sanity client
export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  useCdn: import.meta.env.PROD, // Use CDN in production, skip in development for fresh data
  apiVersion: '2026-02-02',
  // Optional: Add token for authenticated requests (for drafts/private data)
  // token: import.meta.env.SANITY_API_TOKEN,
});

// Initialize the image URL builder
const builder = imageUrlBuilder(sanityClient);

/**
 * Helper function for generating optimized image URLs from Sanity
 * @param source - Sanity image source object
 * @returns Image URL builder instance for chaining methods
 * @example
 * urlFor(post.featuredImage).width(800).height(400).url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Get image dimensions from a Sanity image asset
 * @param image - Sanity image object with asset reference
 * @returns Object with width, height, and aspect ratio
 */
export function getImageDimensions(image: {
  asset?: {
    _ref?: string;
    metadata?: {
      dimensions?: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
}) {
  if (!image?.asset?._ref) {
    return { width: 0, height: 0, aspectRatio: 1 };
  }

  // Extract dimensions from asset reference if available
  // Format: image-{id}-{width}x{height}-{format}
  const ref = image.asset._ref;
  const dimensions = ref.match(/-(\d+)x(\d+)-/);

  if (dimensions) {
    const width = parseInt(dimensions[1], 10);
    const height = parseInt(dimensions[2], 10);
    return {
      width,
      height,
      aspectRatio: width / height,
    };
  }

  // Fallback to metadata if available
  if (image.asset.metadata?.dimensions) {
    return image.asset.metadata.dimensions;
  }

  return { width: 0, height: 0, aspectRatio: 1 };
}
