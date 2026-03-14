# Mini Motion — Architecture

## Overview

AI Video Content Automation platform built with Next.js 16 (App Router), Supabase, and MiniMax APIs.
Users can generate video scripts from text, create AI videos, music, and voiceovers, then preview and download the combined result.

## Design Goals

- Feature-based architecture for scalability and maintainability
- Clear separation between routing (app/) and business logic (features/)
- Shared UI components available to all features
- API routes kept thin — delegate to lib/ services

## Project Structure

```
src/
├── app/                              # Next.js routing layer (thin shells only)
│   ├── api/                          # API route handlers
│   │   ├── generate-music/           # POST → MiniMax music generation
│   │   ├── generate-script/          # POST → MiniMax script generation
│   │   ├── generate-tts/             # POST → MiniMax TTS voiceover
│   │   ├── generate-video/           # POST/GET → MiniMax video generation + polling
│   │   └── projects/                 # CRUD for projects and scenes
│   │       ├── route.ts              # GET (list) / POST (create)
│   │       └── [id]/
│   │           ├── route.ts          # GET / PATCH / DELETE
│   │           └── scenes/
│   │               ├── route.ts      # GET / POST
│   │               └── [sceneId]/
│   │                   └── route.ts  # PATCH
│   ├── auth/callback/route.ts        # Re-exports from features/auth
│   ├── editor/page.tsx               # Re-exports from features/editor
│   ├── preview/[id]/page.tsx         # Re-exports from features/preview
│   ├── page.tsx                      # Re-exports from features/dashboard
│   ├── layout.tsx                    # Root layout with AuthProvider
│   └── globals.css                   # Global styles
│
├── components/                       # GLOBAL shared UI components
│   └── ui/
│       ├── button.tsx                # shadcn Button (cva variants)
│       ├── card.tsx                  # shadcn Card
│       ├── input.tsx                 # shadcn Input
│       ├── label.tsx                 # shadcn Label
│       └── textarea.tsx              # shadcn Textarea
│
├── features/                         # Feature modules (business logic + UI)
│   ├── auth/
│   │   ├── api/callback/route.ts     # OAuth callback handler
│   │   ├── components/
│   │   │   └── auth-provider.tsx     # Supabase Auth context + hooks
│   │   └── index.ts                  # Public exports: AuthProvider, useAuth
│   │
│   ├── dashboard/
│   │   ├── page.tsx                  # Dashboard page (project list, login)
│   │   └── index.ts                  # Public exports
│   │
│   ├── editor/
│   │   ├── page.tsx                  # Script editor page
│   │   └── index.ts                  # Public exports
│   │
│   └── preview/
│       ├── page.tsx                  # Preview page (combined playback)
│       └── index.ts                  # Public exports
│
└── lib/                              # Shared services and utilities
    ├── minimax.ts                    # MiniMax API client (video, music, TTS, script)
    ├── supabase/
    │   ├── client.ts                 # Browser Supabase client
    │   ├── server.ts                 # Server Supabase client
    │   └── types.ts                  # Database types
    └── utils.ts                      # cn() utility
```

## Feature Module Convention

Each feature follows this structure:

```
features/<name>/
├── components/       # React components specific to this feature
├── hooks/            # Custom hooks specific to this feature
├── types/            # TypeScript types/interfaces
├── api/              # API route handlers (if feature-owned)
├── page.tsx          # Main page component (if applicable)
└── index.ts          # Barrel exports (public API of the feature)
```

**Rules:**

- Features import from `@/components/ui/*` for shared UI
- Features import from other features via barrel `@/features/<name>`
- Features should NOT reach into another feature's internal files
- `app/` pages are thin shells that re-export from features

## Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| Framework     | Next.js 14 (App Router)         |
| Auth          | Supabase Auth (GitHub OAuth)    |
| Database      | Supabase (PostgreSQL)           |
| Storage       | Supabase Storage (music bucket) |
| AI - Text     | MiniMax (abab6.5s-chat)         |
| AI - Video    | MiniMax (T2V-01-Director)       |
| AI - Music    | MiniMax (music-2.5)             |
| AI - Voice    | MiniMax (speech-01-turbo)       |
| Styling       | Tailwind CSS                    |
| UI Components | shadcn/ui (cva)                 |

## API Overview

| Endpoint                              | Method | Purpose                   |
| ------------------------------------- | ------ | ------------------------- |
| `/api/generate-script`                | POST   | Generate video script     |
| `/api/generate-video`                 | POST   | Start video generation    |
| `/api/generate-video?taskId=...`      | GET    | Poll video status         |
| `/api/generate-music`                 | POST   | Generate background music |
| `/api/generate-tts`                   | POST   | Generate voiceover        |
| `/api/projects`                       | GET    | List user projects        |
| `/api/projects`                       | POST   | Create project            |
| `/api/projects/[id]`                  | GET    | Get project + scenes      |
| `/api/projects/[id]`                  | PATCH  | Update project            |
| `/api/projects/[id]`                  | DELETE | Delete project            |
| `/api/projects/[id]/scenes`           | POST   | Create scenes             |
| `/api/projects/[id]/scenes/[sceneId]` | PATCH  | Update scene              |
