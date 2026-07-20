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

-- Helpers for sharing (lookup auth.users from server actions)
create or replace function public.get_user_id_by_email(target_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = target_email limit 1;
$$;

create or replace function public.get_user_email_by_id(target_user_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select email from auth.users where id = target_user_id limit 1;
$$;

grant execute on function public.get_user_id_by_email(text) to anon, authenticated;
grant execute on function public.get_user_email_by_id(uuid) to anon, authenticated;
