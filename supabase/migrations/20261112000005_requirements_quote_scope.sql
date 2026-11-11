-- Requirements (admin only)
create table if not exists requirements (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  description text check (description is null or length(description) <= 2000),
  category text check (category is null or length(category) <= 60),
  priority text not null default 'must' check (priority in ('must', 'should', 'could')),
  created_at timestamptz not null default now()
);
create index if not exists requirements_request_idx on requirements(request_id);
alter table requirements enable row level security;
drop policy if exists "admin manages requirements" on requirements;
create policy "admin manages requirements" on requirements for all to authenticated
  using (has_role('admin')) with check (has_role('admin'));

-- Scope and timeline on quotes
alter table quotes add column if not exists scope text;
alter table quotes add column if not exists timeline_days int;
do $$ begin
  alter table quotes add constraint quotes_scope_len
    check (scope is null or length(scope) <= 4000);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table quotes add constraint quotes_timeline_range
    check (timeline_days is null or timeline_days between 1 and 1000);
exception when duplicate_object then null; end $$;

-- Customer view now includes scope and timeline
create or replace function get_quote(t text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare qr quotes; rr requests;
begin
  select * into qr from quotes where approval_token = t and status <> 'draft';
  if not found then return null; end if;
  select * into rr from requests where id = qr.request_id;
  return jsonb_build_object(
    'quote_number', qr.quote_number,
    'status', qr.status,
    'currency', qr.currency,
    'subtotal', qr.subtotal,
    'tax_percent', qr.tax_percent,
    'total', qr.total,
    'valid_until', qr.valid_until,
    'expired', (qr.status = 'sent' and qr.valid_until is not null and qr.valid_until < current_date),
    'terms', qr.terms,
    'scope', qr.scope,
    'timeline_days', qr.timeline_days,
    'customer_name', rr.name,
    'request_code', rr.request_code,
    'responded_at', qr.responded_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'description', i.description, 'qty', i.qty, 'unit_price', i.unit_price)
        order by i.position)
      from quote_items i where i.quote_id = qr.id), '[]'::jsonb)
  );
end $$;

-- Admin sends a draft: must have items and a valid date; returns the link token
create or replace function send_quote(q uuid)
returns jsonb language plpgsql set search_path = public as $$
declare qr quotes;
begin
  if not has_role('admin') then raise exception 'not allowed'; end if;
  select * into qr from quotes where id = q for update;
  if not found then raise exception 'quote not found'; end if;
  if qr.status <> 'draft' then raise exception 'only a draft quote can be sent'; end if;
  if not exists (select 1 from quote_items where quote_id = q) then
    raise exception 'add at least one item before sending';
  end if;
  if qr.valid_until is not null and qr.valid_until < current_date then
    raise exception 'the valid-until date is in the past';
  end if;
  update quotes set status = 'sent', sent_at = now() where id = q;
  return jsonb_build_object('approval_token', qr.approval_token, 'quote_number', qr.quote_number);
end $$;

revoke execute on function send_quote(uuid) from public, anon;
grant execute on function send_quote(uuid) to authenticated;
grant execute on function get_quote(text) to anon, authenticated;

notify pgrst, 'reload schema';

