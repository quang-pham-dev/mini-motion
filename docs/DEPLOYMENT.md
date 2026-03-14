# Deployment Guide

Complete guide for deploying Mini Motion to production.

## Overview

Mini Motion can be deployed to:

- **Vercel** (Recommended) - Zero-config deployment
- **Self-hosted** - Docker, Kubernetes, etc.

## Vercel Deployment (Recommended)

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings

### 2. Environment Variables

Add these environment variables in Vercel project settings:

| Variable                        | Description          | Required |
| ------------------------------- | -------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key    | Yes      |
| `MINIMAX_API_KEY`               | MiniMax API key      | Yes      |

### 3. Build Settings

Vercel auto-detects Next.js. Verify settings:

- **Framework Preset:** Next.js
- **Build Command:** `pnpm build` (or `next build`)
- **Output Directory:** `.next`

### 4. Deploy

Click "Deploy". Vercel will:

1. Install dependencies
2. Run build
3. Deploy to preview URL
4. Provide production URL on success

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## Supabase Production Setup

### Database

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run migrations:

```bash
# Export from local
pnpm db:pull

# Or run SQL in Supabase SQL Editor
# Copy contents of supabase/schema.sql
```

### Authentication

1. Go to Authentication → Providers
2. Enable GitHub OAuth:
   - Create GitHub OAuth App
   - Add Client ID and Secret
3. Configure redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### Storage

1. Go to Storage
2. Create `music` bucket (public)
3. Set bucket policy for public access

### API Keys

Keep these secure:

```env
# Production .env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
MINIMAX_API_KEY=your_api_key_here
```

## Environment Configuration

### Development vs Production

| Variable                   | Development   | Production     |
| -------------------------- | ------------- | -------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | localhost URL | Production URL |
| Environment                | development   | production     |

### Adding New Environment Variables

After adding new env vars in Vercel:

1. Go to Settings → Environment Variables
2. Add variable
3. Redeploy for changes to take effect

## Post-Deployment Checklist

- [ ] Verify authentication works
- [ ] Test API endpoints
- [ ] Check storage uploads
- [ ] Verify MiniMax API integration
- [ ] Test video generation flow
- [ ] Check error logging

## Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors locally
npm run check-types
npm run build
```

### Authentication Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check redirect URLs in Supabase
- Ensure OAuth credentials are set

### API Errors

- Verify `MINIMAX_API_KEY` is set
- Check API key has sufficient credits
- Review Vercel function logs

### CORS Errors

- Ensure Supabase URL matches exactly
- Check browser console for details

## Performance Optimization

### Edge Functions

For better performance, consider:

- Edge runtime for API routes
- CDN for static assets
- Image optimization

### Caching

TanStack Query handles client-side caching. For SSR:

- Use `getQueryClient()` for server prefetching
- Configure appropriate `staleTime`

### Monitoring

Set up error tracking:

- Vercel Analytics
- Sentry for error tracking
- Supabase Realtime for database events

## CI/CD

### GitHub Actions

Example workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run check-types
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Secrets

Add these in GitHub repository settings:

- `VERCEL_TOKEN` - From Vercel Account Settings
- `VERCEL_ORG_ID` - From Vercel Project Settings
- `VERCEL_PROJECT_ID` - From Vercel Project Settings

## Security

### Environment Variables

- Never commit `.env` files
- Use Vercel dashboard for production secrets
- Rotate API keys periodically

### Headers

Next.js includes security headers by default. Verify in `next.config.mjs`.

### Rate Limiting

Implement rate limiting for API routes if needed:

```typescript
// src/app/api/generate-video/route.ts
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const { success } = await rateLimit.limit(request.ip ?? 'default');

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Handle request
}
```

## Rollback

To rollback in Vercel:

1. Go to Deployments
2. Find previous working deployment
3. Click "..."
4. Select "Promote to Production"
