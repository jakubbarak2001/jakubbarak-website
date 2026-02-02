import { sanityClient } from './sanity';
import type { BlogPost, BlogPostPreview, Category } from '@types/sanity';

// ============================================================================
// Types
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PostQueryOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

// ============================================================================
// GROQ Query Strings
// ============================================================================

/**
 * Base fields for post previews
 */
const POST_PREVIEW_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  featuredImage {
    asset,
    alt
  },
  author-> {
    _id,
    name,
    image
  },
  categories[]-> {
    _id,
    title,
    slug
  }
`;

/**
 * Fetch all published posts with basic fields, ordered by publishedAt descending
 */
const ALL_POSTS_QUERY = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
  ${POST_PREVIEW_FIELDS}
}`;

/**
 * Fetch a single post by slug with all fields
 */
const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  excerpt,
  content,
  publishedAt,
  featuredImage {
    asset,
    alt,
    caption,
    hotspot,
    crop
  },
  author-> {
    _id,
    _type,
    name,
    slug,
    bio,
    image,
    socialLinks
  },
  categories[]-> {
    _id,
    _type,
    title,
    slug,
    description
  },
  seo {
    metaTitle,
    metaDescription,
    keywords,
    ogImage
  },
  featured
}`;

/**
 * Fetch featured/recent posts with a limit
 */
const FEATURED_POSTS_QUERY = `*[_type == "post" && defined(publishedAt)] | order(featured desc, publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  featuredImage {
    asset,
    alt
  },
  author-> {
    _id,
    name,
    image
  },
  categories[]-> {
    _id,
    title,
    slug
  }
}`;

/**
 * Fetch posts filtered by category slug
 */
const POSTS_BY_CATEGORY_QUERY = `*[_type == "post" && defined(publishedAt) && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  featuredImage {
    asset,
    alt
  },
  author-> {
    _id,
    name,
    image
  },
  categories[]-> {
    _id,
    title,
    slug
  }
}`;

/**
 * Fetch all categories
 */
const ALL_CATEGORIES_QUERY = `*[_type == "category"] | order(title asc) {
  _id,
  _type,
  title,
  slug,
  description
}`;

/**
 * Fetch paginated posts with optional category filter and search
 */
const PAGINATED_POSTS_QUERY = `{
  "items": *[_type == "post" && defined(publishedAt)
    && ($category == "" || $category in categories[]->slug.current)
    && ($search == "" || title match $search || excerpt match $search)
  ] | order(publishedAt desc) [$start...$end] {
    ${POST_PREVIEW_FIELDS}
  },
  "total": count(*[_type == "post" && defined(publishedAt)
    && ($category == "" || $category in categories[]->slug.current)
    && ($search == "" || title match $search || excerpt match $search)
  ])
}`;

/**
 * Fetch all post slugs for static path generation
 */
const ALL_POST_SLUGS_QUERY = `*[_type == "post" && defined(publishedAt)].slug.current`;

// ============================================================================
// Data Fetching Functions
// ============================================================================

/**
 * Fetch all published blog posts
 * @returns Array of blog post previews ordered by publish date
 */
export async function getAllPosts(): Promise<BlogPostPreview[]> {
  return sanityClient.fetch<BlogPostPreview[]>(ALL_POSTS_QUERY);
}

/**
 * Fetch paginated blog posts with optional filtering
 * @param options - Pagination and filter options
 * @returns Paginated result with posts and metadata
 */
export async function getPaginatedPosts(
  options: PostQueryOptions = {}
): Promise<PaginatedResult<BlogPostPreview>> {
  const { page = 1, pageSize = 10, category = '', search = '' } = options;
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  // Add wildcard for partial matching in search
  const searchPattern = search ? `*${search}*` : '';
  
  const result = await sanityClient.fetch<{ items: BlogPostPreview[]; total: number }>(
    PAGINATED_POSTS_QUERY,
    { start, end, category, search: searchPattern }
  );
  
  const totalPages = Math.ceil(result.total / pageSize);
  
  return {
    items: result.items,
    total: result.total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Fetch all post slugs for static path generation
 * @returns Array of slug strings
 */
export async function getAllPostSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(ALL_POST_SLUGS_QUERY);
}

/**
 * Fetch a single blog post by its slug
 * @param slug - The URL slug of the post
 * @returns The full blog post or null if not found
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return sanityClient.fetch<BlogPost | null>(POST_BY_SLUG_QUERY, { slug });
}

/**
 * Fetch featured/recent posts with a limit
 * @param limit - Maximum number of posts to return (default: 3)
 * @returns Array of blog post previews
 */
export async function getFeaturedPosts(limit: number = 3): Promise<BlogPostPreview[]> {
  return sanityClient.fetch<BlogPostPreview[]>(FEATURED_POSTS_QUERY, { limit });
}

/**
 * Fetch posts filtered by category
 * @param categorySlug - The slug of the category to filter by
 * @returns Array of blog post previews in that category
 */
export async function getPostsByCategory(categorySlug: string): Promise<BlogPostPreview[]> {
  return sanityClient.fetch<BlogPostPreview[]>(POSTS_BY_CATEGORY_QUERY, { categorySlug });
}

/**
 * Fetch all categories
 * @returns Array of all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  return sanityClient.fetch<Category[]>(ALL_CATEGORIES_QUERY);
}
