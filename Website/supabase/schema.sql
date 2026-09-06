create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Student',
  weekly_goal integer not null default 5 check (weekly_goal > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  code text not null default '',
  color text not null default 'bg-sky-100 text-sky-700',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course text not null default '',
  due date not null,
  priority text not null check (priority in ('high', 'medium', 'low')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course text not null default '',
  day text not null,
  time time not null,
  kind text not null check (kind in ('class', 'exam')),
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null default '',
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null check (status in ('reading', 'planned', 'finished')),
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.books enable row level security;

create policy "Profiles belong to the current user" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Courses belong to the current user" on public.courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Tasks belong to the current user" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Events belong to the current user" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Books belong to the current user" on public.books for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
