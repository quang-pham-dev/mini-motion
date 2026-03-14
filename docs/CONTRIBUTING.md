# Contributing Guide

Thank you for your interest in contributing to Mini Motion!

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Open a new issue with:
   - Clear description
   - Use cases
   - Potential alternatives
   - Mockups if applicable

### Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account (for local development)
- MiniMax API key (for AI features)

### Quick Start

```bash
# Clone fork
git clone https://github.com/YOUR_USERNAME/mini-motion.git
cd mini-motion

# Add upstream
git remote add upstream https://github.com/quang-pham-dev/mini-motion.git

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm dev
```

### Running Tests

```bash
# TypeScript check
pnpm run check-types

# Lint
pnpm run lint

# Format
pnpm run format
```

## Git Workflow

### Branch Naming

Use descriptive branch names:

```
feat/add-video-generation
fix/auth-redirect-issue
docs/update-api-reference
refactor/services-layer
chore/update-dependencies
```

### Commit Messages

Follow conventional commits:

```
feat: add video generation feature
fix: resolve auth redirect issue
docs: update API documentation
refactor: simplify data fetching
chore: update dependencies
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

### Creating PRs

1. Update your branch:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push to your fork:

   ```bash
   git push origin feat/your-feature
   ```

3. Open Pull Request with:
   - Clear title
   - Description of changes
   - Related issue number
   - Screenshots for UI changes

4. Address review feedback

## Coding Standards

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use proper TypeScript types
- Avoid `any`

### React/Next.js

- Use functional components
- Use hooks for state/effects
- Keep components small and focused
- Use proper naming conventions

**Do:**

```typescript
export function useProject(id: string) {
  const { data } = useGetProject(id);
  return data;
}
```

**Don't:**

```typescript
// Avoid anonymous functions in callbacks
items.map((item) => <Item key={item.id} {...item} />)
```

### Services Layer

Follow the established patterns:

- Create `api.ts` for fetch functions
- Create `query-keys.ts` for query keys
- Create `queries.ts` for useQuery hooks
- Create `mutations.ts` for useMutation hooks

See [Services Documentation](SERVICES.md) for details.

### Styling

- Use Tailwind CSS classes
- Follow existing component patterns
- Use `cn()` utility for conditional classes

### File Organization

```
src/
├── features/<name>/
│   ├── components/
│   ├── hooks/
│   └── page.tsx
├── services/
│   └── <entity>/
└── lib/
```

## Testing

### Philosophy

- Test behavior, not implementation
- Focus on user-facing functionality
- Write tests that give confidence

### Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch
```

### Writing Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useGetProject } from '@/services/projects';

describe('useGetProject', () => {
  it('fetches project data', async () => {
    const { result } = renderHook(() => useGetProject('proj_123'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

## Documentation

### Updating Docs

- Update related documentation when changing code
- Use clear, concise language
- Include code examples where helpful

### Doc Standards

- Use Markdown formatting
- Include table of contents for long docs
- Add code blocks with language hints

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

## Getting Help

- Open an issue for bugs/features
- Join community discussions
- Check existing documentation

---

Thank you for contributing! 🎉
