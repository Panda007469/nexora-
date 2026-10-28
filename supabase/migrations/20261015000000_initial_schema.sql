-- ─────────────────────────────────────────────────────────────────
-- Nexora — initial schema
-- Tables: user_roles, members, requests, tasks, projects
-- Helpers: has_role(), set_updated_at() trigger
-- RLS: enabled + policies on all 5 tables
-- Storage: project-images bucket + policies
-- ─────────────────────────────────────────────────────────────────

-- Step 0: pgcrypto (provides gen_random_uuid)
create extension if not exists "pgcrypto";


-- ─────────────────────────────────────────────────────────────────
-- Step 1: Tables
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.user_roles (
  user_id  uuid references auth.users (id) on delete cascade primary key,
  role     text not null check (role in ('admin', 'member'))
);

create table if not exists public.members (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    references auth.users (id) on delete set null,
  name        text    not null,
  role_title  text    not null,
  email       text    not null,
  photo_url   text,
  skills      text[]  not null default '{}',
  links       jsonb   not null default '{}',
  sort_order  int     not null default 0
);

create table if not exists public.requests (
  id           uuid        primary key default gen_random_uuid(),
  student_name text        not null check (char_length(student_name) <= 120),
  college      text        not null check (char_length(college) <= 200),
  email        text        not null check (char_length(email) <= 254),
  service_type text        not null check (char_length(service_type) <= 100),
  description  text        not null check (char_length(description) <= 3000),
  deadline     date,
  status       text        not null default 'new'
                           check (status in ('new', 'assigned', 'done')),
  created_at   timestamptz not null default now()
);

create table if not exists public.tasks (
  id          uuid        primary key default gen_random_uuid(),
  request_id  uuid        references public.requests (id) on delete cascade,
  title       text        not null,
  assigned_to uuid        references public.members (id) on delete set null,
  status      text        not null default 'pending'
                          check (status in ('pending', 'in_progress', 'done')),
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  category    text        not null
                          check (category in ('hardware', 'embedded', 'frontend', 'other')),
  description text        not null,
  tech_used   text[]      not null default '{}',
  images      text[]      not null default '{}',
  demo_url    text,
  github_url  text,
  featured    boolean     not null default false,
  published   boolean     not null default false,
  created_at  timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────────
-- Step 2: Helper function + trigger
-- ─────────────────────────────────────────────────────────────────

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role    = _role
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();


-- ─────────────────────────────────────────────────────────────────
-- Step 3: Enable RLS on every table
-- ─────────────────────────────────────────────────────────────────

alter table public.user_roles  enable row level security;
alter table public.members     enable row level security;
alter table public.requests    enable row level security;
alter table public.tasks       enable row level security;
alter table public.projects    enable row level security;


-- ─────────────────────────────────────────────────────────────────
-- Step 4: RLS policies
-- ─────────────────────────────────────────────────────────────────

-- user_roles: admin only
create policy "admin: full access on user_roles"
  on public.user_roles
  for all
  using      (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- members: public read, admin write
create policy "public: read members"
  on public.members
  for select
  using (true);

create policy "admin: write members"
  on public.members
  for all
  using      (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- requests: anonymous insert; admin full
create policy "public: insert requests"
  on public.requests
  for insert
  with check (true);

create policy "admin: select/update/delete requests"
  on public.requests
  for all
  using      (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- tasks: admin full; member reads and updates status on own tasks
create policy "admin: full access on tasks"
  on public.tasks
  for all
  using      (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "member: select own tasks"
  on public.tasks
  for select
  using (
    assigned_to in (
      select id from public.members where user_id = auth.uid()
    )
  );

create policy "member: update status on own tasks"
  on public.tasks
  for update
  using (
    assigned_to in (
      select id from public.members where user_id = auth.uid()
    )
  )
  with check (
    assigned_to in (
      select id from public.members where user_id = auth.uid()
    )
  );

-- projects: public reads published; admin full
create policy "public: read published projects"
  on public.projects
  for select
  using (published = true);

create policy "admin: full access on projects"
  on public.projects
  for all
  using      (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- ─────────────────────────────────────────────────────────────────
-- Step 5: Storage bucket for project images
-- ─────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

create policy "admin: upload project images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'project-images'
    and public.has_role(auth.uid(), 'admin')
  );

create policy "admin: update project images"
  on storage.objects
  for update
  using (
    bucket_id = 'project-images'
    and public.has_role(auth.uid(), 'admin')
  );

create policy "admin: delete project images"
  on storage.objects
  for delete
  using (
    bucket_id = 'project-images'
    and public.has_role(auth.uid(), 'admin')
  );
