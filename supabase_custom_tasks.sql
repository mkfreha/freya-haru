create table custom_tasks (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  cat text not null default 'both',
  section text not null default 'Дополнительно',
  icon text default '📌',
  created_at timestamptz default now()
);

alter table custom_tasks enable row level security;
create policy "allow all" on custom_tasks for all using (true) with check (true);
