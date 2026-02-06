# Jakub Barák Website

A personal website and blog built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [Sanity.io](https://www.sanity.io) as the headless CMS.

## Tech Stack

- **Framework**: Astro 4.x
- **Styling**: Tailwind CSS 3.x
- **CMS**: Sanity.io
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Sanity.io account (free tier available)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd jakubbarak-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Sanity.io Setup](#sanityio-setup) below)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:4321](http://localhost:4321) in your browser

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Sanity.io Setup

### 1. Create a Sanity Project

1. Go to [Sanity.io](https://www.sanity.io) and sign up for a free account
2. Create a new project in the [Sanity dashboard](https://www.sanity.io/manage)
3. Note your **Project ID** and **Dataset** name (typically "production")

### 2. Initialize Sanity Studio (Separate Project)

Create a separate Sanity Studio project for content management:

```bash
# In a separate directory (not inside this Astro project)
mkdir jakubbarak-studio
cd jakubbarak-studio
npm create sanity@latest
```

During setup:
- Select your project from the list
- Choose the "Blog" schema template (or create custom schemas)
- Select TypeScript (recommended)

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Sanity credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_read_token  # Optional for public data
```

To get an API token (if needed):
1. Go to your project in [Sanity Manage](https://www.sanity.io/manage)
2. Navigate to **API** → **Tokens**
3. Create a new token with "Read" permissions

### 4. Define Blog Schema in Sanity Studio

In your Sanity Studio project, create these schemas:

**Post Schema** (`schemas/post.ts`):
```typescript
export default {
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() },
    { name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 },
    { name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] },
    { name: 'publishedAt', title: 'Published At', type: 'datetime', validation: Rule => Rule.required() },
    { name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }] },
    { name: 'author', title: 'Author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'reference', to: [{ type: 'category' }] }] },
    { name: 'featured', title: 'Featured', type: 'boolean', initialValue: false },
  ],
}
```

**Author Schema** (`schemas/author.ts`):
```typescript
export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'bio', title: 'Bio', type: 'text' },
    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
  ],
}
```

**Category Schema** (`schemas/category.ts`):
```typescript
export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() },
    { name: 'description', title: 'Description', type: 'text' },
  ],
}
```

### 5. Verify Integration

1. Start the development server: `npm run dev`
2. Visit [http://localhost:4321/test-sanity](http://localhost:4321/test-sanity)
3. If connected successfully, you'll see a green confirmation message
4. **Remove** `src/pages/test-sanity.astro` after verification

## Project Structure

```
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   └── PortableTextRenderer.astro  # Renders Sanity rich text
├── layouts/
│   └── BaseLayout.astro
├── lib/
│   ├── sanity.ts                   # Sanity client configuration
│   └── sanityQueries.ts            # GROQ queries and data fetching
├── pages/
│   └── index.astro
├── styles/
│   └── global.css
└── types/
    └── sanity.ts                   # TypeScript interfaces
```

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@layouts/*` | `src/layouts/*` |
| `@lib/*` | `src/lib/*` |
| `@types/*` | `src/types/*` |

## Using the Sanity Integration

### Fetching Posts

```typescript
import { getAllPosts, getPostBySlug } from '@lib/sanityQueries';

// Get all posts
const posts = await getAllPosts();

// Get single post by slug
const post = await getPostBySlug('my-post-slug');
```

### Rendering Portable Text

```astro
---
import PortableTextRenderer from '@components/PortableTextRenderer.astro';
import { getPostBySlug } from '@lib/sanityQueries';

const post = await getPostBySlug('my-post');
---

<PortableTextRenderer content={post.content} />
```

### Generating Image URLs

```typescript
import { urlFor } from '@lib/sanity';

// Generate optimized image URL
const imageUrl = urlFor(post.featuredImage)
  .width(800)
  .height(400)
  .format('webp')
  .url();
```

## Troubleshooting

### "Connection Error" on test page

- Verify your `.env` file has the correct `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET`
- Ensure the Sanity project exists and is accessible
- Check if CORS is configured in your Sanity project settings

### No posts showing

- Make sure you've created content in Sanity Studio
- Verify posts have a `publishedAt` date set
- Check the Sanity Studio for any unpublished drafts

### TypeScript errors

- Run `npm run build` to check for type errors
- Ensure all imports use the correct path aliases
- Verify types match your Sanity schema

## Environment Variables Reference

| Variable | Description | Required | Public |
|----------|-------------|----------|--------|
| `PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID | Yes | Yes |
| `PUBLIC_SANITY_DATASET` | Dataset name (e.g., "production") | Yes | Yes |
| `SANITY_API_TOKEN` | Read token for authenticated requests | No | No |

---

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com) with automatic rebuilds triggered by Sanity content changes.

### Prerequisites

- A [Vercel](https://vercel.com) account (free tier available)
- Your Sanity project configured and working locally
- A GitHub/GitLab/Bitbucket repository for this project

### Deploy to Vercel

#### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jakubbarak/jakubbarak-website&env=PUBLIC_SANITY_PROJECT_ID,PUBLIC_SANITY_DATASET&envDescription=Sanity.io%20credentials%20for%20CMS%20integration)

#### Option 2: Manual Setup

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**
   - Import your repository
   - Vercel will auto-detect Astro and configure the build settings

3. **Configure build settings** (usually auto-detected):
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Click "Deploy"**

### Configure Environment Variables in Vercel

After your initial deployment, configure the required environment variables:

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Environment | Required |
|----------|-------|-------------|----------|
| `PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID | Production, Preview, Development | Yes |
| `PUBLIC_SANITY_DATASET` | `production` (or your dataset name) | Production, Preview, Development | Yes |
| `SANITY_API_TOKEN` | Your Sanity read token | Production, Preview, Development | No (only for private datasets) |

> **Note:** `SANITY_API_TOKEN` is only required if your Sanity dataset is set to private. For public datasets (the default), the token is not needed.

**To get your Sanity credentials:**
1. Go to [Sanity Manage](https://www.sanity.io/manage)
2. Select your project
3. **Project ID**: Found in the project overview
4. **API Token**: Go to **API** → **Tokens** → **Add API token** with "Viewer" permissions

4. **Redeploy** your project after adding environment variables:
   - Go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Select **"Redeploy"**

### Set Up Automatic Rebuilds with Sanity Webhook

To automatically rebuild your site when content changes in Sanity:

#### Step 1: Create a Deploy Hook in Vercel

1. Go to your Vercel project **Settings** → **Git**
2. Scroll to **"Deploy Hooks"**
3. Create a new hook:
   - **Name**: `sanity-content-update`
   - **Branch**: `main` (or your production branch)
4. Click **"Create Hook"**
5. **Copy the generated webhook URL** (looks like: `https://api.vercel.com/v1/integrations/deploy/prj_xxx/xxx`)

#### Step 2: Configure Webhook in Sanity

1. Go to [Sanity Manage](https://www.sanity.io/manage)
2. Select your project
3. Navigate to **API** → **Webhooks**
4. Click **"Create webhook"**
5. Configure the webhook:

| Setting | Value |
|---------|-------|
| **Name** | `Vercel Deploy` |
| **URL** | Paste your Vercel deploy hook URL |
| **Dataset** | `production` (or your dataset) |
| **Trigger on** | Create, Update, Delete |
| **Filter** | `_type in ["post", "author", "category"]` (optional - limits to specific types) |
| **Projection** | Leave empty |
| **Status** | Enabled |
| **HTTP method** | POST |
| **HTTP Headers** | Leave empty |
| **Secret** | Leave empty (Vercel hooks don't require auth) |

6. Click **"Save"**

#### Step 3: Test the Webhook

1. Go to your Sanity Studio
2. Make a small change to any content (e.g., edit a blog post title)
3. Publish the change
4. Check your Vercel dashboard → **Deployments**
5. You should see a new deployment triggered by "Deploy Hook"

### Deployment Configuration Files

This project includes the following deployment configuration:

**`vercel.json`** - Vercel-specific configuration:
- Optimized caching headers for static assets
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Regional deployment settings

**`.vercelignore`** - Files excluded from deployment:
- Development files and IDE settings
- Test files and coverage reports
- Local environment files

### Custom Domain Setup

1. Go to your Vercel project **Settings** → **Domains**
2. Add your custom domain (e.g., `jakubbarak.com`)
3. Configure DNS records as shown by Vercel:
   - **A Record**: `76.76.19.19` → `@`
   - **CNAME Record**: `cname.vercel-dns.com` → `www`
4. Wait for DNS propagation (can take up to 48 hours)
5. SSL certificate is automatically provisioned by Vercel

### Monitoring Deployments

**Vercel Dashboard:**
- View deployment logs in real-time
- Check build times and function execution
- Monitor bandwidth and request metrics

**Deployment Notifications:**
1. Go to project **Settings** → **Notifications**
2. Configure notifications for:
   - Deployment completed
   - Deployment failed
   - Domain configuration issues

### Troubleshooting Deployment

#### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Test locally** with `npm run build`
4. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

#### Webhook Not Triggering

1. **Verify webhook URL** is correct in Sanity
2. **Check webhook is enabled** in Sanity settings
3. **Test manually** by clicking "Trigger" in Sanity webhook settings
4. **Check Vercel deploy hook** is active

#### Content Not Updating

1. **Verify CDN cache**: Sanity uses CDN caching. For immediate updates, ensure `useCdn: false` for authenticated requests or wait for cache invalidation
2. **Check publish status**: Drafts are not fetched by default
3. **Redeploy manually** to force content refresh

### Production Checklist

Before going live, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Custom domain is configured and SSL is active
- [ ] Sanity webhook is configured and tested
- [ ] `test-sanity.astro` page is removed from production
- [ ] Google Analytics or other tracking is configured (if needed)
- [ ] SEO metadata is complete for all pages
- [ ] Robots.txt and sitemap are configured
- [ ] Performance tested with Lighthouse (target: 90+ score)

### Continuous Deployment Workflow

With this setup, your deployment workflow is:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Code Changes   │────▶│   Git Push      │────▶│ Vercel Deploy   │
│  (Development)  │     │   (GitHub)      │     │ (Auto-trigger)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Content Changes │────▶│ Sanity Webhook  │────▶│ Vercel Deploy   │
│ (Sanity Studio) │     │    (POST)       │     │ (Auto-trigger)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Code changes**: Push to Git → Vercel automatically deploys
**Content changes**: Publish in Sanity → Webhook triggers Vercel rebuild

---

## License

MIT
