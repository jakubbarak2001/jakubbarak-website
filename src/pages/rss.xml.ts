import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts } from '@lib/sanityQueries';
import { urlFor } from '@lib/sanity';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  
  const siteUrl = context.site?.href || 'https://jakubbarak.com';
  
  return rss({
    // Channel metadata
    title: 'Jakub Barak - Blog',
    description: 'Thoughts on learning, self-improvement, polymathy, and personal growth. Exploring ideas that help us become better versions of ourselves.',
    site: siteUrl,
    
    // RSS items from blog posts
    items: posts.map((post) => {
      const postUrl = new URL(`/blog/${post.slug?.current || ''}`, siteUrl).href;
      const imageUrl = post.featuredImage?.asset 
        ? urlFor(post.featuredImage).width(1200).height(630).auto('format').url()
        : undefined;
      
      return {
        title: post.title,
        pubDate: new Date(post.publishedAt),
        description: post.excerpt || '',
        link: postUrl,
        // Add author if available
        author: post.author?.name || 'Jakub Barak',
        // Add categories if available
        categories: post.categories?.map(cat => cat.title) || [],
        // Custom fields for enhanced RSS
        customData: imageUrl 
          ? `<enclosure url="${imageUrl}" type="image/jpeg" length="0" />`
          : undefined,
      };
    }),
    
    // Custom XML configuration
    customData: `
      <language>en-us</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <generator>Astro</generator>
      <docs>https://www.rssboard.org/rss-specification</docs>
      <ttl>60</ttl>
      <image>
        <url>${new URL('/og-image.png', siteUrl).href}</url>
        <title>Jakub Barak - Blog</title>
        <link>${siteUrl}</link>
      </image>
      <atom:link href="${new URL('/rss.xml', siteUrl).href}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
    `.trim(),
    
    // Stylesheet for browser viewing
    stylesheet: '/rss-styles.xsl',
  });
}
