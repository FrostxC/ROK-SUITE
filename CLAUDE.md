# EMBERFALL — Kingdom 3709 (rok-suite)

Rise of Kingdoms kingdom website for Frost (FrostxC). Forked from avweigel/rok-suite,
heavily customized. **Goal: the best all-in-one ROK tool for players + leadership,
eventually a monetizable multi-kingdom SaaS** (see ROADMAP.md).

## Where things live
- **Repo:** github.com/FrostxC/ROK-SUITE (`main`; every push auto-deploys)
- **Live site:** https://rok-suite-web-two.vercel.app (Vercel project `rok-suite-web`, root dir `apps/web`)
- **Local:** `C:\ROK\rok-suite-main` (moved out of OneDrive July 2026 — never move it back;
  OneDrive sync caused EPERM build locks). A locked leftover stub may exist at
  `C:\Users\jubay\OneDrive\ROK` — safe to delete.
- **Helper tooling:** `C:\ROK\_ui-tools` (Playwright screenshot/verify scripts; run with
  `$env:PLAYWRIGHT_BROWSERS_PATH="0"`), `C:\ROK\_db-tools` (pg schema runner).
- **Backend:** the user's own Supabase project `rysfokmwwqcndoscmrsg`. Free tier —
  **pauses after ~1 week idle** (symptom: DNS fails, app shows "Failed to fetch").
  Fix = user clicks Restore in supabase.com/dashboard. A keep-alive cron is a wanted TODO.

## Working conventions
- Run dev: `pnpm --dir C:\ROK\rok-suite-main\apps\web dev` → localhost:3000
- ALWAYS `pnpm --dir ...\apps\web build` before pushing (Vercel runs next build).
  Stop dev server first (Windows file locks on `.next`).
- Verify visually with Playwright scripts in `_ui-tools` (local + live after deploy),
  then commit + push. The page scrolls inside the AppSidebar `<main>` (not window) —
  scroll listeners/IntersectionObserver must account for that.
- i18n: new UI strings need keys in ALL 15 files in `apps/web/messages/` (script it).
- Theme: "Ancient Dark Kingdom" — near-black bg, blood crimson (#DC143C/#8B0000)
  power accents, aged gold (#C9A961) titles/borders, Cinzel display serif, 8px max
  radius, CSS vars in `app/globals.css`. NO light mode (toggle = graphite lift).
- **No CSS filters on animated elements** (caused 27fps hero jank — glow gets baked
  into SVGs as gradients instead).
- Role passwords (client-side gates): admin123 / officer123 / power123.
- DKP default data: `public/data/players_data.json` = real KD3709 export (176 players,
  baseline scan → kills/deads all 0 until a real-period scan is uploaded).
- Commander portraits: `public/commanders/*.png` (41 bundled, kebab-case names, from
  cdn.rokbattles.com `img_icon_HeroProfile_{id}.png`; name→id scraped from rokbattles
  feed DOM). Missing still: Gorgo, Nebuchadnezzar II, Gilgamesh, Shapur I, David IV,
  Tokugawa Ieyasu, Heraclius. `CommanderChip` falls back to initials badges.
- Commander meta: `app/commanders/meta-data.ts` — built from REAL rokbattles.com live
  battle-feed scrapes (usage counts), not guides. Refresh by re-scraping
  (`_ui-tools/scrape2.js`, `deep-hunt.js`).
- Equipment sprites: `public/equipment/*.png` (143 bundled, kebab-case item names) +
  auto-generated map `app/equipment/equip-sprites.ts` — regenerate with
  `_ui-tools/dl-equip.js`. Source of truth: the FULL in-game item table (id/name/sprite,
  18 locales) lives in a rokbattles JS chunk — extracted copy at
  `_ui-tools/equip-gamedata.json` (`equip-bundle-hunt.js` + `extract-equip.py` re-extract
  it). NOTE: "Lance/Bow of the Eternal Empire" don't exist in-game (EE's only weapon is
  the Shield) — equipment-meta.ts uses the real KvK cav lance / archer bow.

## Current state (July 2026)
Shipped: full redesign + EMBERFALL rebrand (was Angmar/3923 → Kingdom 3709), animated
hero (letter forge-in, arrow pierces THROUGH the name w/ letter recoil, embers, parallax,
scroll progress, 3D tilt cards, top-warriors marquee, Sun Tzu war-cry, stat count-up),
calculators suite (/calculators, 6 tools), commander pairings w/ portraits (/commanders),
DKP min-deads requirement (% of power, "Deads / Min" column, deads shown in K),
AoO planner upgrades (Battle Day live match timer tab, Strategy Map route drawing w/
4 team colors + phases, structure icons), Excel import pipeline for stats.

## Next up (agreed direction)
DONE from the top-10 research ladder: My Warrior Profile + Compare Scans (on /dkp),
Equipment Manager (/equipment: meta builds w/ pairing swaps, awaken/crit priority
from creator research, set builder).

DONE July 2026: Equipment page visual upgrade + CORRECTNESS pass. The builds
were transcribed frame-by-frame from BilegtROK's two guides (videos in the
user's Downloads: "Never Go Wrong Crafting These Sets" Z0zoV7EGkNs +
"Step by Step Awaken & Crit Priority" Or09gydysUI). Tooling in _ui-tools:
grab-frames2.js (dense frame extraction), equip-match.py / compare-cands.py /
zoom-cells.py (identify each build-grid icon against the bundled sprites).
`app/equipment/equipment-meta.ts` now holds TROOP_BUILDS (Infantry/Cavalry/
Archer/Siege, each with 2-3 open-field + 1-2 rally VARIANTS — the video's build
columns), ACCESSORIES, the awaken/crit PRIORITY matrix + cost tables, and
SET_BUILDER_CATALOG + SET_BONUSES. Page shows all variants side-by-side per
troop/mode; Set Builder is LEGENDARY-ONLY across all 6 slots (incl. legs) with
live set-bonus completion tracking (verified bonuses only for Eternal Empire /
Dragon's Breath / Hellish Wasteland — theriagames). `data/equipment.json` is no
longer used by the page. NOTE: earlier version had wrong-troop pieces (infantry
helm on cav/archer) and only 1 build per troop — both fixed. If adding set
bonuses for Glorious Goddess/Wolf/Witch/Knight, source them and add to
SET_BONUSES (piece counts already track for any set in the catalog).

DONE July 2026: MGE application pipeline upgrade — hero CTA is now "Apply for
MGE" → /mge/apply, a dedicated player-facing application page styled like
/apply (before-you-start card, event summary, embedded form, friendly
no-open-event state). /mge stays the officer event manager. (The /apply
Submit Lead Info page is untouched, still in sidebar + tools.) MgeApplyTab requires THREE screenshots — commander profile (replaced the
manual level/stars/skills entry at the user's request; a picture can't be
typoed), gear set ("the set you'll RUN, not your best"), armaments — plus a
"why do you want him" reason. Legacy manual-stats fields still render on old
applications only; the officer AddApplicantForm still has manual stat entry.
MgeReviewTab auto-ranks applicants by DKP score from the latest /dkp scan
(normalizeName matching + officer "No DKP match" manual link via
dkp_match_name), Finalize keeps the DKP order, and a Result Mail modal fills
the officer's announcement template DETERMINISTICALLY ({{rank}}/{{name}}/
{{tier}}/{{list}} placeholders — code substitution, never the AI; template
persisted in localStorage) with handoff to /rok-mail via the
'rok-mail-draft' localStorage key.
MGE events are TROOP-TYPED (July 17): event setup picks Infantry/Cavalry/
Archer/Leadership (stored as focused_commander = "Infantry MGE" — schema
untouched; `parseMgeEventType` in lib/mge/commanders.ts detects typed vs
legacy fixed-commander events). Players pick their own commander of that type
in the apply form (required; filtered via `commandersForEventType`, newest
first); review cards show each applicant's commander chip; Result Mail rows
support per-row {{commander}}. The full commander dataset lives in
`lib/mge/commanders.ts` — ALL 110 live legendaries typed
Infantry/Cavalry/Archer/Leadership/Other (Engineering+Integration), newest
first, P = Prime. Regenerate with `_ui-tools/gen-mge-commanders.py` (reads
the rokbattles game-data bundle + commander-reference, with web-verified
OVERRIDES for new commanders — David IV is Cavalry, Vercingetorix Leadership,
Archimedes Engineering).
✅ DB MIGRATION APPLIED (user ran mge-apply-upgrade.sql in the dashboard SQL
editor, July 17 2026): the 4 new mge_applications columns exist, the MGE
tables have full RLS policies incl. DELETE (they were missing — deletes
returned "200, 0 rows" and silently did nothing), and the mge-screenshots
bucket is set up. Verified by REST probes (insert with new columns = 201;
delete = row actually gone). Name pickers read the kingdom scan via
`lib/mge/kingdom-roster.ts` (dkp_datasets → bundled players_data.json →
alliance_roster) and are searchable by governor ID. Note: for ~1 min after
any future migration, PostgREST's schema cache can reject new columns
("Could not find column in schema cache") — the form now tells players to
just retry. Diagnostic probes: `_ui-tools/mge-db-audit.js`,
`mge-delete-probe.js`, `mge-insert-probe.js` (read .env.local anon key).

DONE July 17: Governor Profiles — `/governor` (searchable directory of all
scanned governors) + `/governor/[id]` (permanent per-player page, resolves by
governor ID OR name). Built by `lib/governor/profile.ts` from the kingdom scan
+ shared DKP config (MERGE it over DEFAULT_CONFIG — the stored config is
partial, raw use crashes on simpleFormula) + MGE history (matched by name incl.
dkp_match_name). Linked from the DKP Warrior Profile card and MGE review cards.
Read-only views of already-visible data → no security-model change. For
players: shareable record/flex page; for officers: migrant vetting. Verify
script: `_ui-tools/governor-shot.js`.

**AUTH/SECURITY — reviewed, still Phase 2 (nothing built yet).** Current model:
anon key + fully-open "allow public" RLS; the admin/officer passwords only gate
the UI, so anyone with dev tools can read/write/delete any row via REST. Real
fix = Supabase Auth with **Discord OAuth** (alliances live on Discord) + a
`profiles` table (user→role→governor_id) + real RLS (public read; officer/admin
write; players edit only their own application). This is also the multi-tenancy
foundation. It's a big, own-milestone effort touching every write path — write
an ADR first; do NOT bolt it onto feature work.

1. **Hall of Heroes recognition tracker** (#3 on the ladder — rides scan data; an
   archived /recognition page exists to revive).
2. Supabase keep-alive cron (after user restores the paused project).
3. Remaining commander portraits (list above) via more rokbattles scrape passes.
4. Roadmap phase 2: real auth (Discord OAuth) + multi-tenancy → monetization (ROADMAP.md).
