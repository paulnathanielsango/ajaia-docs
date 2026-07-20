# Tech Stack — AJAIA Document App

Recommended stack for a **2-hour MVP** that satisfies the PRD. Optimized for speed, clarity, and **Vercel + Supabase deployment**.

---

## Core Framework

PASSWORD=ajaiadocs2026

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15** (App Router) | Full-stack in one repo; Server Actions reduce API boilerplate |
| Language | **TypeScript** | Type safety with minimal overhead |
| Package manager | **pnpm** | Fast installs, disk-efficient |
| Runtime model | **React Server Components + Server Actions** | Fetch on server; mutate via actions, not REST routes |

---

## UI & Styling

| Layer | Choice | Why |
|-------|--------|-----|
| Styling | **Tailwind CSS** | Ships with `create-next-app`; fast layout |
| Components | **shadcn/ui** (Radix primitives) | Accessible buttons, dialogs, inputs in minutes |
| Icons | **Lucide React** | Pairs with shadcn/ui |
| Toasts | **Sonner** | Lightweight success/error feedback |
| Rich text editor | **Tiptap** + `@tiptap/starter-kit` + `@tiptap/extension-underline` | Covers bold, italic, underline, headings, lists out of the box |

---

## Data & Persistence

| Layer | Choice | Why |
|-------|--------|-----|
| Database | **Supabase Postgres** | Hosted DB works on Vercel; no ephemeral filesystem issues |
| Data access | **`@supabase/supabase-js` + `@supabase/ssr`** | Official Next.js App Router integration; no ORM boilerplate |
| Content storage | **JSONB** in `documents.content` | Tiptap native format; preserves formatting on reload |
| Migrations | **Supabase SQL Editor** | Run schema SQL once in dashboard — fastest for 2h MVP |

> **Why not Prisma?** Prisma + Supabase on Vercel requires connection pooling (`pgbouncer`), extra config, and more moving parts. For 2 tables and a prototype, the Supabase client is simpler and faster.

---

## Auth & Sharing

| Layer | Choice | Why |
|-------|--------|-----|
| Auth | **Supabase Auth** (email/password) | Built-in sessions, user management, works on Vercel |
| Session handling | **`@supabase/ssr`** middleware + server client | Cookie-based auth for App Router |
| Users | **2 demo accounts** created in Supabase dashboard | Alice (owner), Bob (sharee) — switch via login |
| Access control | **Server Actions** (app-level checks) | Enforce owner/share logic in code; skip RLS for MVP speed |

---

## Forms, Validation & Upload

| Layer | Choice | Why |
|-------|--------|-----|
| Validation | **Zod** | Shared schemas for Server Actions |
| Forms | Native forms + Server Actions | Sufficient for MVP; no React Hook Form needed |
| File upload | **Native `<input type="file">` + Server Action** | No extra storage service for `.txt` / `.md` only |
| Supported imports | **`.txt`, `.md`** | Read as plain text → wrap in Tiptap paragraph nodes; state limit clearly in UI |

---

## Testing & Quality

| Layer | Choice | Why |
|-------|--------|-----|
| Test runner | **Vitest** | Fast; works well with Next.js |
| Meaningful test | **Zod schema or `canAccessDocument` helper** | One focused unit test beats shallow E2E for time budget |
| Linting | **ESLint** (from `create-next-app`) | Default setup |

---

## Deployment

| Layer | Choice | Why |
|-------|--------|-----|
| Hosting | **Vercel** | Native Next.js support; one-click deploy |
| Database + Auth | **Supabase** (same project) | One service for DB and auth; free tier covers assessment |

### Environment variables (Vercel + local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both local dev and Vercel use the **same Supabase project** — no separate prod DB setup.

---

## Explicitly Not Using (scope cuts)

| Skipped | Reason |
|---------|--------|
| Prisma / SQLite / Turso | Supabase Postgres is simpler for Vercel deploy |
| Auth.js / bcrypt | Supabase Auth handles this |
| `.docx` parsing | `mammoth` adds complexity; `.txt`/`.md` satisfy PRD with clear UI disclaimer |
| UploadThing / Vercel Blob / Supabase Storage | Overkill for text import |
| Clerk / OAuth | Email/password via Supabase is enough |
| Supabase Realtime | Not required by PRD; adds complexity |
| Row Level Security (RLS) | Enforce in Server Actions first; add RLS only if time permits |
| Redux / Zustand | URL + server state is enough |
| TanStack Table | Simple document list doesn't need it |
| Separate API routes | Server Actions cover all mutations |

---

## `create-next-app` Prompt Answers

Run from the `AJAIA` folder (see `instruction.md` for exact commands):

```
✔ Would you like to use the recommended Next.js defaults? › No
✔ Would you like to use TypeScript? › Yes
✔ Which linter would you like to use? › ESLint
✔ Would you like to use Tailwind CSS? › Yes
✔ Would you like your code inside a `src/` directory? › Yes
✔ Would you like to use App Router? › Yes
✔ Would you like to use Turbopack for `next dev`? › Yes
✔ Would you like to customize the import alias? › No  (@/*)
```

**If offered React Compiler:** No (skip for MVP speed).

---

## Post-Scaffold Dependencies

```bash
# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# Editor
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/extension-underline

# Validation & UX
pnpm add zod sonner

# shadcn/ui (initializes components)
pnpm dlx shadcn@latest init

# Testing
pnpm add -D vitest
```
