import type { PortableTextBlock as BasePortableTextBlock } from '@portabletext/types';

/**
 * Localized string field, e.g. { en: 'Title', cs: 'Nadpis' }
 */
export type LocaleString = {
  [locale: string]: string | undefined;
};

/**
 * Localized Portable Text field, e.g. { en: [...blocks], cs: [...blocks] }
 */
export type LocalePortableTextBlock = {
  [locale: string]: BasePortableTextBlock[] | undefined;
};

/**
 * Sanity image asset reference
 */
export interface SanityImageAsset {
  _ref: string;
  _type: 'reference';
}

/**
 * Sanity image hotspot for focal point cropping
 */
export interface SanityImageHotspot {
  x: number;
  y: number;
  height: number;
  width: number;
}

/**
 * Sanity image crop settings
 */
export interface SanityImageCrop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Sanity image with all optional metadata
 */
export interface SanityImage {
  _type: 'image';
  asset: SanityImageAsset;
  alt?: string;
  caption?: string;
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
}

/**
 * Sanity slug field
 */
export interface SanitySlug {
  _type: 'slug';
  current: string;
}

/**
 * Author document type
 */
export interface Author {
  _id: string;
  _type: 'author';
  name: LocaleString;
  slug?: SanitySlug;
  bio?: LocalePortableTextBlock;
  image?: SanityImage;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

/**
 * Category document type
 */
export interface Category {
  _id: string;
  _type: 'category';
  title: LocaleString;
  slug: SanitySlug;
  description?: LocaleString;
}

/**
 * SEO metadata object
 */
export interface SeoMetadata {
  metaTitle?: LocaleString;
  metaDescription?: LocaleString;
  keywords?: string[];
  ogImage?: SanityImage;
}

/**
 * Portable Text block type with custom extensions
 */
export type PortableTextBlock = BasePortableTextBlock;

/**
 * Blog post document type
 */
export interface BlogPost {
  _id: string;
  _type: 'post';
  _createdAt: string;
  _updatedAt: string;
  title: LocaleString;
  slug: SanitySlug;
  excerpt?: LocaleString;
  content: LocalePortableTextBlock;
  publishedAt: string;
  author?: Author;
  categories?: Category[];
  featuredImage?: SanityImage;
  seo?: SeoMetadata;
  featured?: boolean;
}

/**
 * Blog post preview (for list views with minimal data)
 */
export interface BlogPostPreview {
  _id: string;
  title: LocaleString;
  slug: SanitySlug;
  excerpt?: LocaleString;
  publishedAt: string;
  featuredImage?: SanityImage;
  author?: Pick<Author, '_id' | 'name' | 'image'>;
  categories?: Pick<Category, '_id' | 'title' | 'slug'>[];
}
