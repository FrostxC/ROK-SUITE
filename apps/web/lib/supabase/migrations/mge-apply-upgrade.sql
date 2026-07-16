-- MGE application upgrade (July 2026):
--   * commander screenshot (replaces manual level/skills/stars entry — the
--     profile picture shows all of it and can't be typoed)
--   * armaments screenshot upload
--   * "why do you want this commander" reason field
--   * officer-set DKP name link for applicants whose in-game name doesn't
--     match the latest DKP scan (name changes / alt spellings)
ALTER TABLE mge_applications ADD COLUMN IF NOT EXISTS commander_screenshot_url text;
ALTER TABLE mge_applications ADD COLUMN IF NOT EXISTS armaments_screenshot_url text;
ALTER TABLE mge_applications ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE mge_applications ADD COLUMN IF NOT EXISTS dkp_match_name text;

-- ── RLS repair ──────────────────────────────────────────────────────────
-- The live DB was missing DELETE policies on the MGE tables: deletes came
-- back "200 OK, 0 rows" and events could never be removed from the UI.
-- Recreate the full permissive policy set + role grants (admin is gated
-- client-side in this app, same model as the rest of the schema).
do $$
declare
  t text;
  tables text[] := array['mge_events','mge_selections','mge_event_commanders','mge_rank_tiers','mge_applications'];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Allow public read" on public.%I', t);
    execute format('drop policy if exists "Allow public insert" on public.%I', t);
    execute format('drop policy if exists "Allow public update" on public.%I', t);
    execute format('drop policy if exists "Allow public delete" on public.%I', t);
    execute format('create policy "Allow public read" on public.%I for select using (true)', t);
    execute format('create policy "Allow public insert" on public.%I for insert with check (true)', t);
    execute format('create policy "Allow public update" on public.%I for update using (true) with check (true)', t);
    execute format('create policy "Allow public delete" on public.%I for delete using (true)', t);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- ── Screenshot bucket (idempotent) ──────────────────────────────────────
insert into storage.buckets (id, name, public) values ('mge-screenshots','mge-screenshots', true)
on conflict (id) do nothing;
drop policy if exists "Allow public upload" on storage.objects;
drop policy if exists "Allow public read mge" on storage.objects;
create policy "Allow public upload" on storage.objects for insert with check (bucket_id = 'mge-screenshots');
create policy "Allow public read mge" on storage.objects for select using (bucket_id = 'mge-screenshots');

-- PostgREST schema reload so the new columns are visible immediately
NOTIFY pgrst, 'reload schema';
