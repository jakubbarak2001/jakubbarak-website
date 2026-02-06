import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import type { PortableTextBlock } from '@types/sanity';

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
 * Resolve a localized string value from a Sanity locale field.
 *
 * Supports:
 * - Plain strings
 * - Locale objects (e.g. { en: 'Title', cs: 'Nadpis' })
 * Falls back to:
 * - `en` when the requested locale is missing
 * - The first string value found in the object
 * - Empty string if nothing is available
 */
export function getLocaleString(val: any, locale: string = 'en'): string {
  if (!val) return '';

  // Already a plain string
  if (typeof val === 'string') {
    return val;
  }

  if (typeof val === 'object') {
    // Locale-specific value
    const byLocale = val[locale];
    if (typeof byLocale === 'string') {
      return byLocale;
    }

    // Fallback to English
    if (locale !== 'en' && typeof val?.en === 'string') {
      return val.en;
    }

    // Fallback to the first string value in the object
    const firstString = Object.values(val).find(
      (v) => typeof v === 'string'
    ) as string | undefined;

    if (typeof firstString === 'string') {
      return firstString;
    }
  }

  return '';
}

/**
 * Resolve localized Portable Text blocks from a Sanity locale field.
 *
 * Supports:
 * - Direct Portable Text arrays
 * - Locale objects where each key is a locale and the value is a PT array
 * Falls back to:
 * - `en` when the requested locale is missing
 * - The first Portable Text array found in the object
 * - Empty array if nothing is available
 */
export function getLocalePortableText(
  val: any,
  locale: string = 'en'
): PortableTextBlock[] {
  if (!val) return [];

  // Already an array of Portable Text blocks
  if (Array.isArray(val)) {
    return val as PortableTextBlock[];
  }

  if (typeof val === 'object') {
    const byLocale = val[locale];
    if (Array.isArray(byLocale)) {
      return byLocale as PortableTextBlock[];
    }

    // Fallback to English
    if (locale !== 'en' && Array.isArray(val?.en)) {
      return val.en as PortableTextBlock[];
    }

    // Fallback to the first array value in the object
    const firstArray = Object.values(val).find((v) => Array.isArray(v));
    if (Array.isArray(firstArray)) {
      return firstArray as PortableTextBlock[];
    }
  }

  return [];
}

/**
 * Serialize Portable Text blocks to plain text.
 * Used when a string is needed (e.g. meta descriptions, JsonLd).
 */
export function portableTextToPlainText(blocks: PortableTextBlock[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  const text = blocks
    .filter((block: any) => block._type === 'block')
    .map((block: any) =>
      block.children?.map((child: any) => child.text).join(' ') || ''
    )
    .join(' ');
  return text.replace(/\s+/g, ' ').trim();
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
