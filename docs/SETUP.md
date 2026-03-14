# Setup Guide

This guide covers setting up Mini Motion for local development.

## Prerequisites

| Tool    | Version       | Notes           |
| ------- | ------------- | --------------- |
| Node.js | 18.x or later | LTS recommended |
| pnpm    | 8.x or later  | Package manager |
| Git     | Latest        | Version control |

## 1. Clone Repository

```bash
git clone https://github.com/quang-pham-dev/mini-motion.git
cd mini-motion
```

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MiniMax API (Required)
MINIMAX_API_KEY=your_minimax_api_key
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **Settings** → **API**
3. Copy **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Getting MiniMax API Key

1. Register at [MiniMax](https://platform.minimaxi.com)
2. Go to API Keys section
3. Create a new API key
4. Copy to `MINIMAX_API_KEY`

## 4. Database Setup

### Option A: Supabase Dashboard

1. Go to your Supabase project
2. Open **SQL Editor**
3. Run the migrations in `supabase/schema.sql`

### Option B: Drizzle CLI

```bash
# Generate migrations
pnpm db:generate

# Push to database
pnpm db:push

# Or run migrations
pnpm db:migrate
```

## 5. Storage Setup

Create a storage bucket for music files:

1. Go to Supabase Dashboard → **Storage**
2. Create new bucket named `music`
3. Make it public

## 6. Authentication Setup

Enable GitHub OAuth:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable GitHub
3. Create GitHub OAuth app:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - New OAuth App
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

## 7. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common Issues

### "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Database connection errors

- Verify Supabase URL is correct
- Check that your IP is allowed in Supabase settings
- Ensure database is running

### API errors

- Verify MiniMax API key is valid
- Check API key has sufficient credits

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

## Next Steps

- Read [Architecture Overview](ARCHITECTURE.md)
- Learn about [API Endpoints](API.md)
- Set up [Deployment](DEPLOYMENT.md)
