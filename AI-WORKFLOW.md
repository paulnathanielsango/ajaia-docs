# AI Workflow — AJAIA

## Tools used

- **Cursor Agent** — implementation, file scaffolding, and iterative fixes
- **Principal SWE / UI/UX skills** — architecture and landing page design guidance
- **Project docs** — `instruction.md`, `Tech-stack.md`, and `PRD.md` as source of truth

## Where AI sped up work

- Boilerplate for Supabase SSR clients, middleware, and Server Actions
- shadcn component integration and light-theme landing layout
- Tiptap editor wiring with toolbar actions
- Documentation (README, architecture note)

## What was changed or rejected from AI output

- Removed dependency on `next-themes` for Sonner — hardcoded light theme instead
- Replaced invalid `supabase.auth.admin` calls with SQL RPC helpers for email lookup
- Dropped `@tailwindcss/typography` prose classes — used simple element styling instead
- Kept email/password auth alongside Google OAuth per product requirement (original tech stack only specified email)

## Verification

- `pnpm build` — TypeScript and Next.js production compile
- `pnpm test` — Vitest unit tests for `canAccessDocument`
- Manual checks: Google sign-in redirect, email login, create/save/reopen document, file import, share between demo users

## Correctness mindset

AI-generated code was treated as a draft. Each boundary (auth session, permissions, Supabase queries) was reviewed against Supabase SSR patterns and the PRD before accepting.
