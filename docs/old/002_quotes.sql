-- ─────────────────────────────────────────────────────────────────────────────
-- Nexora — migration 002: requirements, quotes (Phase 5)
-- Run once in the Supabase SQL editor or via `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPATIBILITY FIX: single-argument overload for has_role()
--
-- The initial schema defines has_role(_user_id uuid, _role text).
-- The RPCs below use has_role('admin') (single-arg, current-user shorthand).
-- Adding this overload avoids touching any existing two-arg call sites.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.has_role(_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), _role);
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Step 1: Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.requirements (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        not null references public.requests(id) on delete cascade,
  title       text        not null,
  description text,
  category    text,
  priority    text        not null default 'must'
                          check (priority in ('must', 'should', 'could')),
  created_at  timestamptz not null default now()
);

create table if not exists public.quotes (
  id               uuid        primary key default gen_random_uuid(),
  request_id       uuid        not null references public.requests(id) on delete cascade,
  version          int         not null default 1,
  scope            text,
  total            numeric(12,2) not null default 0,
  currency         text        not null default 'INR',
  timeline_days    int,
  valid_until      date,
  status           text        not null default 'draft'
                               check (status in ('draft','sent','approved','rejected')),
  token_hash       text        unique,  -- SHA-256 hex; raw token is never stored
  customer_comment text,
  responded_at     timestamptz,
  created_at       timestamptz not null default now()
);

create table if not exists public.quote_items (
  id          uuid          primary key default gen_random_uuid(),
  quote_id    uuid          not null references public.quotes(id) on delete cascade,
  description text          not null,
  qty         numeric       not null default 1 check (qty > 0),
  unit_price  numeric(12,2) not null default 0 check (unit_price >= 0)
);


-- ─────────────────────────────────────────────────────────────────────────────
-- Step 2: Enable RLS
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.requirements  enable row level security;
alter table public.quotes        enable row level security;
alter table public.quote_items   enable row level security;


-- ─────────────────────────────────────────────────────────────────────────────
-- Step 3: RLS policies  (uses the new single-arg overload)
-- ─────────────────────────────────────────────────────────────────────────────

create policy "admin all" on public.requirements
  for all
  to authenticated
  using      (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "admin all" on public.quotes
  for all
  to authenticated
  using      (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "admin all" on public.quote_items
  for all
  to authenticated
  using      (public.has_role('admin'))
  with check (public.has_role('admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- Step 4: RPCs
-- ─────────────────────────────────────────────────────────────────────────────

-- send_quote: locks the total, generates a one-time secret token, marks as sent.
-- Returns the RAW token ONCE. Only its SHA-256 hash is stored in the DB.
create or replace function public.send_quote(q uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  raw text;
begin
  if not public.has_role('admin') then
    raise exception 'forbidden';
  end if;

  raw := encode(gen_random_bytes(32), 'hex');

  update public.quotes
  set
    total      = coalesce(
                   (select sum(qty * unit_price) from public.quote_items where quote_id = q),
                   0),
    token_hash = encode(digest(raw, 'sha256'), 'hex'),
    valid_until = coalesce(valid_until, current_date + 14),
    status     = 'sent'
  where id = q
    and status in ('draft', 'sent');

  if not found then
    raise exception 'quote cannot be sent';
  end if;

  return raw;
end;
$$;


-- get_quote_by_token: public read of a single quote via its secret token.
create or replace function public.get_quote_by_token(t text)
returns table (
  id               uuid,
  request_id       uuid,
  version          int,
  scope            text,
  total            numeric,
  currency         text,
  timeline_days    int,
  valid_until      date,
  status           text,
  customer_comment text,
  responded_at     timestamptz,
  created_at       timestamptz,
  expired          boolean,
  items            jsonb
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select
    q.id,
    q.request_id,
    q.version,
    q.scope,
    q.total,
    q.currency,
    q.timeline_days,
    q.valid_until,
    q.status,
    q.customer_comment,
    q.responded_at,
    q.created_at,
    (q.valid_until is not null and q.valid_until < current_date) as expired,
    coalesce(
      (select jsonb_agg(
                jsonb_build_object(
                  'id',          qi.id,
                  'description', qi.description,
                  'qty',         qi.qty,
                  'unit_price',  qi.unit_price
                ) order by qi.id
              )
       from public.quote_items qi
       where qi.quote_id = q.id),
      '[]'::jsonb
    ) as items
  from public.quotes q
  where q.token_hash = encode(digest(t, 'sha256'), 'hex');
end;
$$;


-- respond_to_quote: customer approves or rejects via the secret token.
create or replace function public.respond_to_quote(
  t        text,
  decision text,
  comment  text default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  q_id   uuid;
  q_stat text;
  q_exp  boolean;
begin
  if decision not in ('approved', 'rejected') then
    raise exception 'decision must be approved or rejected';
  end if;

  select
    id,
    status,
    (valid_until is not null and valid_until < current_date)
  into q_id, q_stat, q_exp
  from public.quotes
  where token_hash = encode(digest(t, 'sha256'), 'hex');

  if not found then
    raise exception 'quote not found';
  end if;

  if q_stat != 'sent' then
    raise exception 'quote has already been responded to';
  end if;

  if q_exp then
    raise exception 'quote has expired';
  end if;

  update public.quotes
  set
    status           = decision,
    customer_comment = comment,
    responded_at     = now()
  where id = q_id;
end;
$$;

