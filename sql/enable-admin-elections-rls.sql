alter table public.elections enable row level security;

drop policy if exists "elections_select_authenticated" on public.elections;
drop policy if exists "elections_insert_authenticated" on public.elections;
drop policy if exists "elections_update_authenticated" on public.elections;
drop policy if exists "elections_delete_authenticated" on public.elections;

create policy "elections_select_authenticated"
on public.elections
for select
to authenticated
using (true);

create policy "elections_insert_authenticated"
on public.elections
for insert
to authenticated
with check (true);

create policy "elections_update_authenticated"
on public.elections
for update
to authenticated
using (true)
with check (true);

create policy "elections_delete_authenticated"
on public.elections
for delete
to authenticated
using (true);
-- Run this in Supabase SQL Editor to allow the dashboard admin page
-- to create/update/delete elections for authenticated users.

alter table public.elections enable row level security;

drop policy if exists "elections_select_authenticated" on public.elections;
drop policy if exists "elections_insert_authenticated" on public.elections;
drop policy if exists "elections_update_authenticated" on public.elections;
drop policy if exists "elections_delete_authenticated" on public.elections;

create policy "elections_select_authenticated"
on public.elections
for select
to authenticated
using (true);

create policy "elections_insert_authenticated"
on public.elections
for insert
to authenticated
with check (true);

create policy "elections_update_authenticated"
on public.elections
for update
to authenticated
using (true)
with check (true);

create policy "elections_delete_authenticated"
on public.elections
for delete
to authenticated
using (true);
