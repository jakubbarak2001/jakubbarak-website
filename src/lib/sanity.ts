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
 * Deeply resolve locale-aware strings inside a Portable Text tree.
 *
 * Responsibilities:
 * - Accept either:
 *   - A direct Portable Text array, or
 *   - A locale-mapped field where each key is a locale and the value is a PT array
 * - Walk blocks, children, markDefs, lists, and arbitrary nested objects/arrays
 * - Apply `getLocaleString` to all text-like values so that:
 *   - `span.text` fields become plain strings
 *   - Other localized string fields (captions, labels, etc.) are resolved
 */
export function resolvePortableTextLocale(
  pt: any,
  locale: string = 'en'
): PortableTextBlock[] {
  const baseBlocks = getLocalePortableText(pt, locale);

  const resolveNode = (node: any): any => {
    if (node == null) return node;

    // Arrays: resolve each element (covers blocks, children, lists, markDefs, etc.)
    if (Array.isArray(node)) {
      return node.map((item) => resolveNode(item));
    }

    // Primitive strings: run through getLocaleString
    if (typeof node === 'string') {
      return getLocaleString(node, locale);
    }

    // Non-array objects: resolve each property
    if (typeof node === 'object') {
      const result: any = {};

      const LOCALE_KEY_REGEX = /^[a-z]{2}(?:-[A-Za-z]{2})?$/i;

      for (const [key, value] of Object.entries(node)) {
        if (value == null) {
          result[key] = value;
          continue;
        }

        // Heuristic: locale string map like { en: 'Title', cs: 'Nadpis' }
        // Only treat as locale object when:
        // - it's a plain object (no arrays)
        // - every key looks like a locale code (e.g. "en", "cs", "en-US")
        // - and every value is either a string or null/undefined
        // This avoids collapsing non-locale objects (e.g. markDefs, assets, references)
        const isLocaleObject =
          typeof value === 'object' &&
          !Array.isArray(value) &&
          Object.entries(value).length > 0 &&
          Object.entries(value).every(
            ([k, v]) =>
              LOCALE_KEY_REGEX.test(k) &&
              (v == null || typeof v === 'string')
          );

        if (key === 'text' || typeof value === 'string' || isLocaleObject) {
          // - `text` fields may be locale objects or plain strings
          // - Any plain string is safe to pass (getLocaleString is idempotent)
          // - Locale objects are collapsed to a single string
          result[key] = getLocaleString(value as any, locale);
        } else {
          // Recurse into nested structures (children, markDefs, lists, etc.)
          result[key] = resolveNode(value);
        }
      }

      return result;
    }

    return node;
  };

  return resolveNode(baseBlocks) as PortableTextBlock[];
}

/**
 * Serialize Portable Text blocks to plain text.
 * Used when a string is needed (e.g. meta descriptions, JsonLd).
 */
export function portableTextToPlainText(
  blocks: any,
  locale: string = 'en'
): string {
  const resolvedBlocks = resolvePortableTextLocale(blocks, locale);
  if (!resolvedBlocks || !Array.isArray(resolvedBlocks)) return '';

  const text = resolvedBlocks
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
