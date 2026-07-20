# AJAIA

A lightweight collaborative document workspace built with Next.js and Supabase.

## Features

- Google OAuth and email/password sign-in
- Rich-text editing (bold, italic, underline, headings, lists)
- Document create, rename, save, and delete
- Import `.txt` and `.md` files
- Share documents with other registered users
- Owned vs shared document lists

## Prerequisites

- Node.js 20+
- pnpm
- Supabase project with schema applied

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Both legacy **anon** keys and new **publishable** keys (`sb_publishable_...`) work with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

4. Run the SQL in [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor (includes sharing helper functions).

5. Configure Supabase Auth:

- Enable **Google** provider (Authentication → Providers)
- Add redirect URL: `http://localhost:3000/auth/callback`
- Create demo users: `alice@demo.com`, `bob@demo.com` (password: `password123`)

6. Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| `alice@demo.com` | `password123` | Document owner |
| `bob@demo.com` | `password123` | Share recipient |

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # ESLint
pnpm test     # Vitest unit tests
```

## Supported file imports

- `.txt`
- `.md`

`.docx` is not supported in this MVP.

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Add production redirect URL in Supabase: `https://your-app.vercel.app/auth/callback`
5. Deploy

## Live product

**URL:** see [SUBMISSION.md](SUBMISSION.md) (update after Vercel deploy)

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — design decisions and trade-offs
- [AI-WORKFLOW.md](AI-WORKFLOW.md) — how AI tools were used in this build
- [SUBMISSION.md](SUBMISSION.md) — exact submission contents checklist
- [WALKTHROUGH_VIDEO_URL.txt](WALKTHROUGH_VIDEO_URL.txt) — walkthrough video link
