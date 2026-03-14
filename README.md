# Mini Motion

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

AI Video Content Automation Platform. Generate video scripts, AI videos, music, and voiceovers with AI.

## Features

- **AI Script Generation** - Transform text prompts into structured video scripts
- **AI Video Generation** - Create videos from visual prompts using MiniMax T2V
- **AI Music Generation** - Generate background music that matches your video mood
- **AI Voiceover** - Convert script text to natural speech
- **Preview & Download** - Preview combined playback and download all assets

## Tech Stack

| Category         | Technology                   |
| ---------------- | ---------------------------- |
| Framework        | Next.js 16 (App Router)      |
| Language         | TypeScript                   |
| Auth             | Supabase Auth (GitHub OAuth) |
| Database         | Supabase PostgreSQL          |
| State Management | TanStack Query v5            |
| Styling          | Tailwind CSS                 |
| UI Components    | shadcn/ui                    |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/quang-pham-dev/mini-motion.git
cd mini-motion

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys (see docs/SETUP.md)

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

| Document                             | Description                    |
| ------------------------------------ | ------------------------------ |
| [Setup Guide](docs/SETUP.md)         | Installation and configuration |
| [Architecture](docs/ARCHITECTURE.md) | System design and patterns     |
| [API Reference](docs/API.md)         | REST API documentation         |
| [Services Layer](docs/SERVICES.md)   | TanStack Query patterns        |
| [Deployment](docs/DEPLOYMENT.md)     | Production deployment          |
| [Contributing](docs/CONTRIBUTING.md) | Contribution guidelines        |

## Project Structure

```
src/
├── app/                 # Next.js routing layer
│   ├── api/             # API route handlers
│   └── (pages)          # Page components
├── components/          # Shared UI components
│   └── ui/              # shadcn/ui components
├── features/            # Feature modules
│   ├── auth/            # Authentication
│   ├── dashboard/       # Project list
│   ├── editor/          # Script editor
│   └── preview/         # Video preview
├── lib/                 # Utilities
└── services/            # API services (TanStack Query)
```

## API Overview

| Endpoint               | Method           | Description               |
| ---------------------- | ---------------- | ------------------------- |
| `/api/generate-script` | POST             | Generate video script     |
| `/api/generate-video`  | POST             | Start video generation    |
| `/api/generate-music`  | POST             | Generate background music |
| `/api/generate-tts`    | POST             | Generate voiceover        |
| `/api/projects`        | GET/POST         | List/Create projects      |
| `/api/projects/[id]`   | GET/PATCH/DELETE | Project CRUD              |

See [API Reference](docs/API.md) for detailed documentation.

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MiniMax API
MINIMAX_API_KEY=your_minimax_api_key
```

See [Setup Guide](docs/SETUP.md) for complete configuration.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) first.

---

Built with ❤️ by [Quang Pham](https://github.com/quang-pham-dev)
