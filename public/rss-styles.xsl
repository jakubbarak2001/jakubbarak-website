<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
            background: #f9fafb;
          }
          .header {
            text-align: center;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 2rem;
          }
          .header h1 {
            margin: 0 0 0.5rem;
            font-size: 2rem;
            color: #111827;
          }
          .header p {
            color: #6b7280;
            margin: 0;
          }
          .info-box {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .info-box p {
            margin: 0;
            color: #92400e;
            font-size: 0.9rem;
          }
          .info-box a {
            color: #92400e;
            font-weight: 600;
          }
          .feed-url {
            background: #f3f4f6;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            font-family: monospace;
            font-size: 0.875rem;
            word-break: break-all;
            margin: 1rem 0;
            border: 1px solid #e5e7eb;
          }
          .articles {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .article {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: box-shadow 0.2s;
          }
          .article:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .article h2 {
            margin: 0 0 0.5rem;
            font-size: 1.25rem;
          }
          .article h2 a {
            color: #1f2937;
            text-decoration: none;
          }
          .article h2 a:hover {
            color: #3b82f6;
          }
          .article .meta {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.75rem;
          }
          .article .description {
            color: #4b5563;
            margin: 0;
          }
          .categories {
            margin-top: 0.75rem;
          }
          .category {
            display: inline-block;
            background: #e5e7eb;
            color: #374151;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            margin-right: 0.5rem;
            margin-bottom: 0.25rem;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background: #111827;
              color: #f9fafb;
            }
            .header h1 {
              color: #f9fafb;
            }
            .header p {
              color: #9ca3af;
            }
            .info-box {
              background: #1e3a5f;
              border-color: #3b82f6;
            }
            .info-box p, .info-box a {
              color: #93c5fd;
            }
            .feed-url {
              background: #1f2937;
              border-color: #374151;
              color: #f9fafb;
            }
            .article {
              background: #1f2937;
              border-color: #374151;
            }
            .article h2 a {
              color: #f9fafb;
            }
            .article h2 a:hover {
              color: #60a5fa;
            }
            .article .meta {
              color: #9ca3af;
            }
            .article .description {
              color: #d1d5db;
            }
            .category {
              background: #374151;
              color: #d1d5db;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p><xsl:value-of select="/rss/channel/description"/></p>
        </div>
        
        <div class="info-box">
          <p>
            <strong>This is an RSS feed.</strong> Subscribe by copying the URL into your RSS reader.
            <a href="https://aboutfeeds.com" target="_blank" rel="noopener">Learn more about RSS</a>.
          </p>
        </div>
        
        <div class="feed-url">
          <xsl:value-of select="/rss/channel/atom:link[@rel='self']/@href"/>
        </div>
        
        <h2>Recent Posts</h2>
        <ul class="articles">
          <xsl:for-each select="/rss/channel/item">
            <li class="article">
              <h2>
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="link"/>
                  </xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h2>
              <div class="meta">
                <xsl:value-of select="pubDate"/>
                <xsl:if test="author">
                  <xsl:text> · </xsl:text>
                  <xsl:value-of select="author"/>
                </xsl:if>
              </div>
              <p class="description">
                <xsl:value-of select="description"/>
              </p>
              <xsl:if test="category">
                <div class="categories">
                  <xsl:for-each select="category">
                    <span class="category">
                      <xsl:value-of select="."/>
                    </span>
                  </xsl:for-each>
                </div>
              </xsl:if>
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
