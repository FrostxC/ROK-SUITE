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

-- PostgREST schema reload so the new columns are visible immediately
NOTIFY pgrst, 'reload schema';
