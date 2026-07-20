# AJAIA — Build Instructions & 2-Hour Architecture Plan

This document is the execution plan for the PRD. Follow it in order. The goal is a **working, deployable prototype in ~2 hours**, not production perfection.

**Stack:** Next.js 15 + Supabase (Postgres + Auth) + Tiptap + shadcn/ui → deployed on Vercel.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Login page   │  │ Dashboard    │  │ Document Editor    │ │
│  │ (email/pass) │  │ Owned/Shared │  │ Tiptap + toolbar   │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘ │
│         │                 │                     │            │
│         └─────────────────┴─────────────────────┘            │
│                           │ Server Actions / RSC             │
└───────────────────────────┼─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Middleware  │  │ Server       │  │ Supabase SSR      │ │
│  │ (auth guard)│  │ Actions      │  │ clients           │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘ │
└─────────┼────────────────┼─────────────────────┼───────────┘
          │                │                     │
          └────────────────┴─────────────────────┘
                            ▼
                    ┌──────────────┐
                    │   Supabase   │
                    │  ┌────────┐  │
                    │  │  Auth  │  │  email/password sessions
                    │  └────────┘  │
                    │  ┌────────┐  │
                    │  │Postgres│  │  documents, document_shares
                    │  └────────┘  │
                    └──────────────┘
                            ▲
                    ┌──────────────┐
                    │   Vercel     │  production hosting
                    └──────────────┘
```

### Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monolith | Single Next.js app | No separate API server |
| Mutations | Server Actions | Less code than REST routes |
| Rich text | Tiptap JSON in JSONB column | Formatting survives refresh |
| Auth | Supabase Auth (email/password) | Built-in; works on Vercel; no bcrypt/Auth.js |
| Database | Supabase Postgres | Same project as auth; no Turso/SQLite deploy issues |
| Data access | Supabase JS client (no Prisma) | Fewer dependencies; faster to ship |
| Access control | App-level checks in Server Actions | Skip RLS for MVP speed |
| File import | `.txt` / `.md` only | Simple; UI states limit clearly |
| Sharing model | `document_shares` join table | Owner + explicit grant; visible owned vs shared |

---

## 2. Data Model

Run this SQL in the **Supabase SQL Editor** (Dashboard → SQL → New query):

```sql
-- Documents owned by auth.users
create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'Untitled',
  content     jsonb not null default '{}',
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Sharing: grant another user access to a document
create table public.document_shares (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (document_id, user_id)
);

-- Auto-update updated_at on documents
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

-- Indexes for common queries
create index documents_owner_id_idx on public.documents(owner_id);
create index document_shares_user_id_idx on public.document_shares(user_id);
create index document_shares_document_id_idx on public.document_shares(document_id);
```

> **RLS:** Disabled for MVP. All access checks happen in Server Actions. Add RLS policies later if time permits.

### Demo users

Create in **Supabase Dashboard → Authentication → Users → Add user**:

| Email | Password | Role in demo |
|-------|----------|--------------|
| `alice@demo.com` | `password123` | Document owner |
| `bob@demo.com` | `password123` | Share recipient |

> Use a stronger password in production. For the assessment demo, a simple shared password is fine — document it in the README.

---

## 3. Routes & Pages

| Route | Type | Purpose |
|-------|------|---------|
| `/login` | Client page | Email/password login + signup toggle (optional) |
| `/` | Server page | Redirect → `/documents` or `/login` |
| `/documents` | Server page | List: **My Documents** + **Shared with Me** |
| `/documents/[id]` | Client page | Tiptap editor, rename, save, share, import |
| `/auth/callback` | Route handler | Supabase auth callback (required for SSR) |

---

## 4. Server Actions (core API)

Create `src/actions/documents.ts`:

| Action | Input | Behavior |
|--------|-------|----------|
| `createDocument` | — | New doc for session user |
| `updateDocument` | `{ id, title?, content? }` | Owner or shared user can edit |
| `deleteDocument` | `{ id }` | Owner only |
| `shareDocument` | `{ documentId, email }` | Owner looks up user by email → insert share |
| `importFromFile` | `FormData` (file) | Parse `.txt`/`.md` → new document |

All actions: get session via Supabase server client → validate with Zod → query Supabase → `revalidatePath`.

### Permission helper (`src/lib/permissions.ts`)

```ts
// canAccessDocument(userId, documentId, ownerId, shares)
// Returns true if userId === ownerId OR userId is in shares
```

Test this helper with Vitest — it's the one meaningful automated test.

---

## 5. Supabase Client Setup

### `src/lib/supabase/server.ts`
Server Component / Server Action client (reads cookies).

### `src/lib/supabase/client.ts`
Browser client (login form, editor).

### `src/lib/supabase/middleware.ts`
Refresh session in middleware.

### `src/middleware.ts`
Protect `/documents/*` — redirect unauthenticated users to `/login`.

---

## 6. Feature Checklist (maps to PRD)

### Document creation & editing
- [ ] Create document (button + server action)
- [ ] Rename (inline input in editor header)
- [ ] Tiptap editor with toolbar: Bold, Italic, Underline, H1/H2, Bullet list, Ordered list
- [ ] Explicit Save button (simpler to debug in 2h)
- [ ] Reopen from dashboard list

### File upload
- [ ] Upload `.txt` or `.md` on dashboard
- [ ] Creates new document with filename as title
- [ ] UI badge: "Supports .txt and .md only"

### Sharing
- [ ] Share dialog: enter recipient email
- [ ] Dashboard sections: **My Documents** / **Shared with Me**
- [ ] Badge on shared docs: "Shared by [owner name]"

### Persistence
- [ ] Supabase Postgres
- [ ] Tiptap JSON stored in `content` JSONB column
- [ ] Share relations persist across refresh

### Engineering quality
- [ ] README (later)
- [ ] `.env.example`
- [ ] One Vitest test (`canAccessDocument` helper)
- [ ] `ARCHITECTURE.md` (short, in repo root — later)
- [ ] `AI-WORKFLOW.md` (short note — later)

---

## 7. Time-Boxed Build Plan (~2 hours)

| Phase | Time | Tasks |
|-------|------|-------|
| **0. Scaffold** | 10 min | `create-next-app`, install deps, shadcn init |
| **1. Supabase** | 15 min | Create project, run SQL schema, create demo users, copy env vars |
| **2. Auth** | 20 min | Supabase SSR clients, middleware, login page |
| **3. Document CRUD** | 25 min | Dashboard list, create, open, delete, server actions |
| **4. Editor** | 30 min | Tiptap component, toolbar, save action, rename |
| **5. File import** | 15 min | File input + parse text → Tiptap content |
| **6. Sharing** | 15 min | Share dialog, `document_shares`, split dashboard lists |
| **7. Polish & ship** | 15 min | Error toasts, empty states, 1 test, deploy to Vercel |
| **8. Docs** | 10 min | README, architecture note, AI workflow note |

**If running behind:** Cut delete, simplify toolbar styling. **Do not cut:** auth, persistence, editor, sharing, one test.

---

## 8. Folder Structure (target)

```
AJAIA/
├── supabase/
│   └── schema.sql              # copy of Section 2 SQL (for reference)
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── auth/callback/route.ts
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── actions/
│   │   ├── auth.ts             # signIn, signOut
│   │   └── documents.ts
│   ├── components/
│   │   ├── editor/
│   │   │   ├── document-editor.tsx
│   │   │   └── editor-toolbar.tsx
│   │   ├── document-list.tsx
│   │   ├── share-dialog.tsx
│   │   └── file-import-button.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── permissions.ts      # canAccessDocument — test this
│   │   └── validations.ts      # Zod schemas
│   └── middleware.ts
├── Project-requirements/       # planning docs (this folder)
├── .env.local                  # gitignored
├── .env.example
├── README.md                   # add later
└── vitest.config.ts
```

---

## 9. Step-by-Step: Getting Started

### Step 0 — Prerequisites

- Node.js 20+
- pnpm: `npm install -g pnpm`
- Supabase account: [supabase.com](https://supabase.com) (free tier)

### Step 1 — Scaffold Next.js (run inside `AJAIA`)

```bash
cd /Users/paulnathanielsango/Desktop/Upskilling/AJAIA

pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

> If prompted "directory not empty" (because of `Project-requirements/`), confirm — only scaffold app files; keep `Project-requirements/`.

**Prompt cheat sheet** (if interactive):

| Prompt | Answer |
|--------|--------|
| TypeScript | **Yes** |
| ESLint | **Yes** |
| Tailwind CSS | **Yes** |
| `src/` directory | **Yes** |
| App Router | **Yes** |
| Turbopack | **Yes** |
| Customize import alias | **No** (`@/*`) |
| React Compiler | **No** |

### Step 2 — Create Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `ajaia-docs` (or similar), set a DB password, choose a region close to you
3. Wait for project to provision (~2 min)
4. Go to **SQL Editor** → paste and run the SQL from **Section 2**
5. Go to **Authentication → Users** → create `alice@demo.com` and `bob@demo.com`
6. Go to **Project Settings → API** → copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3 — Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Create `.env.example` (same keys, placeholder values — commit this).

### Step 4 — Install dependencies

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod sonner \
  @tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/extension-underline

pnpm add -D vitest

pnpm dlx shadcn@latest init
# Style: Default | Base color: Neutral | CSS variables: Yes

pnpm dlx shadcn@latest add button input label card dialog badge sonner
```

### Step 5 — Supabase client setup

Implement in this order:
1. `src/lib/supabase/server.ts` — server client
2. `src/lib/supabase/client.ts` — browser client
3. `src/lib/supabase/middleware.ts` — session refresh helper
4. `src/middleware.ts` — protect `/documents/*`
5. `src/app/auth/callback/route.ts` — auth callback
6. `src/app/(auth)/login/page.tsx` — login form

### Step 6 — Build features in priority order

Follow the time-boxed plan (Section 7): auth → dashboard → editor → import → sharing.

### Step 7 — Run locally

```bash
pnpm dev
```

Open `http://localhost:3000`, log in as `alice@demo.com` / `password123`.

### Step 8 — Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — same Supabase project serves both local and production

No separate production database needed.

---

## 10. Assumptions

- Two demo users are sufficient to demonstrate sharing
- Shared users can **edit** (not view-only) — simpler and still valid
- `.docx` is out of scope; documented in UI
- "Save" is manual (button), not debounced auto-save
- No real-time collaborative editing (Supabase Realtime not used)
- No email notifications on share
- RLS deferred — access enforced in Server Actions

---

## 11. What to Document Later (README)

When implementation is done, the README should include:

1. Setup (`pnpm install`, env vars, `pnpm dev`)
2. Demo accounts (`alice@demo.com` / `bob@demo.com`)
3. Supported file types (`.txt`, `.md`)
4. Live deploy URL
5. Link to `ARCHITECTURE.md` and `AI-WORKFLOW.md`

---

## 12. Next Steps (start development)

1. Run **Step 1** (`pnpm create next-app`) in the `AJAIA` folder
2. Run **Step 2** (create Supabase project + SQL + demo users)
3. Run **Steps 3–4** (env vars + install deps)
4. Tell me when scaffold + Supabase are ready — we implement auth first
