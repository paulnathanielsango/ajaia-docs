# Architecture — AJAIA

## Goal

Deliver a working document app prototype that demonstrates auth, persistence, editing, import, and sharing within a tight time budget.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router + Server Actions |
| Auth & DB | Supabase Auth + Postgres |
| Editor | Tiptap (JSON stored in JSONB) |
| UI | shadcn/ui + Tailwind CSS (light theme) |
| Validation | Zod |
| Tests | Vitest (permissions helper) |

## What we prioritized

1. **End-to-end flows** — sign in → create/edit/save → share → reopen
2. **Simple data model** — `documents` + `document_shares`
3. **Server Actions over REST** — fewer files, faster iteration
4. **App-level access checks** — `canAccessDocument` in Server Actions; RLS deferred for MVP speed

## Auth model

- **Google OAuth** on the landing page (primary UX)
- **Email/password** at `/login` for demo accounts and fallback
- Session handled via `@supabase/ssr` cookies + middleware route guards

## Sharing

- Owner inserts a row in `document_shares` for the recipient's user id
- Lookup by email uses SQL helper functions (`get_user_id_by_email`, `get_user_email_by_id`) with `security definer`
- Shared users can **edit** documents (not view-only) to keep the MVP simple

## File import

- Client uploads `.txt`/`.md` via native file input
- Server Action reads text and converts to Tiptap JSON paragraphs
- Unsupported types are rejected with clear UI messaging

## Explicit trade-offs

| Decision | Rationale |
|----------|-----------|
| No RLS policies | Faster MVP; permissions enforced in Server Actions |
| Manual Save button | Easier to debug than debounced auto-save |
| No realtime collaboration | Out of PRD scope |
| No `.docx` support | Avoids heavy parsing dependencies |
| Publishable Supabase key | Modern Supabase API key format |

## Folder layout

```
src/
├── actions/          # Server Actions (auth, documents)
├── app/              # Routes (landing, login, documents, callback)
├── components/       # UI (auth, editor, lists, shadcn)
└── lib/              # Supabase clients, permissions, validations
```

## Future improvements

- Row Level Security policies in Postgres
- Auto-save with debounce
- User profile table instead of auth.users RPC helpers
- Real-time presence via Supabase Realtime
