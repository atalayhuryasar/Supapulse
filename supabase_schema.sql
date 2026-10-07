-- ==============================================================================
-- Supapulse Schema & RLS Setup
-- ==============================================================================

-- 1. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  supabase_url text not null,
  anon_key text not null,
  target_table text,
  webhook_url text,
  is_active boolean not null default true,
  last_ping_at timestamptz,
  last_ping_status text check (last_ping_status in ('success', 'failed', 'pending')),
  last_ping_code integer,
  last_ping_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration for existing databases
alter table public.projects add column if not exists target_table text;
alter table public.projects add column if not exists webhook_url text;

-- Indexing for fast queries
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_is_active on public.projects(is_active);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies for Projects
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- 2. Ping Logs Table (Optional for detailed history)
create table if not exists public.ping_logs (
  id bigint generated always as identity primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  status text not null check (status in ('success', 'failed')),
  status_code integer,
  response_time_ms integer,
  message text,
  created_at timestamptz not null default now()
);

-- Indexing for logs
create index if not exists idx_ping_logs_project_id on public.ping_logs(project_id);

-- Enable RLS for Ping Logs
alter table public.ping_logs enable row level security;

-- Users can view logs of their own projects
create policy "Users can view logs of their own projects"
  on public.ping_logs for select
  using (
    exists (
      select 1 from public.projects
      where public.projects.id = public.ping_logs.project_id
      and public.projects.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

-- 3. Role Privileges & Grants (Critical for background cron service_role and authenticated users)
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.projects to service_role, authenticated;
grant all on table public.ping_logs to service_role, authenticated;
grant usage, select on all sequences in schema public to service_role, authenticated;

-- Policy to allow authenticated users to insert ping logs for their own projects
create policy "Users can insert ping logs for their own projects"
  on public.ping_logs for insert
  with check (
    exists (
      select 1 from public.projects
      where public.projects.id = public.ping_logs.project_id
      and public.projects.user_id = auth.uid()
    )
  );

