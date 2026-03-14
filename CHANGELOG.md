# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- TanStack Query v5 integration with services layer
- Projects service with queries and mutations
- Scenes service with queries and mutations
- Generators service for video, music, TTS, and script generation
- Video task polling support

### Changed

- Refactored data fetching from manual fetch to TanStack Query
- Updated architecture documentation

## [0.1.0] - 2026-03-14

### Added

- Initial release
- AI Script Generation from text prompts
- AI Video Generation using MiniMax T2V-01-Director
- AI Music Generation using MiniMax music-2.5
- AI Voiceover using MiniMax speech-01-turbo
- Dashboard with project list
- Preview page with combined playback
- Download functionality for generated assets
- GitHub OAuth authentication via Supabase

### Tech Stack

- Next.js 16 (App Router)
- Supabase (Auth, Database, Storage)
- Drizzle ORM
- Tailwind CSS
- shadcn/ui
