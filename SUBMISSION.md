# Submission Checklist — AJAIA

Exactly what is included in this repository.

## Included

| Deliverable | Location |
|-------------|----------|
| Source code | Entire repo (`src/`, `supabase/`, config files) |
| Local setup & run instructions | [README.md](README.md) |
| Architecture note | [ARCHITECTURE.md](ARCHITECTURE.md) |
| AI workflow note | [AI-WORKFLOW.md](AI-WORKFLOW.md) |
| This submission index | [SUBMISSION.md](SUBMISSION.md) |
| Live product URL | See **Live product** below |
| Walkthrough video URL | [WALKTHROUGH_VIDEO_URL.txt](WALKTHROUGH_VIDEO_URL.txt) |
| Screenshots / demo GIF | Optional — not required; setup is standard (`pnpm install` + env + schema) |

## Live product

**URL:** `TODO: paste your Vercel URL here`  
Example shape: `https://ajaia-docs.vercel.app`

After deploy, also add the production auth callback in Supabase:

`https://YOUR-APP.vercel.app/auth/callback`

## Demo accounts (for reviewers)

| Email | Password |
|-------|----------|
| `alice@demo.com` | `password123` |
| `bob@demo.com` | `password123` |

## How to run locally

See [README.md](README.md) — summary:

1. `pnpm install`
2. `cp .env.example .env.local` and fill Supabase keys
3. Run `supabase/schema.sql` in the Supabase SQL Editor
4. `pnpm dev` → http://localhost:3000

## Out of scope (documented)

- Real-time collaborative editing
- `.docx` import
- Postgres RLS (access enforced in Server Actions)
- Auto-save (manual Save button)
