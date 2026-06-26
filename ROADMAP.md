# ROK Suite — Product Roadmap

Goal: the all-in-one Rise of Kingdoms tool for **players** (calculators, meta) and
**leadership** (DKP, emigration, AoO/KvK planning, stats) — eventually a monetizable
multi-kingdom SaaS.

## Positioning / our edge
Competitors specialize: stats-only (rokstats, prokingdoms, rok.center), calculators-only
(codexhelper, rok-calculator), or meta-only (MetaRoK, rokhub). **We integrate officer
workflows *with* stats and calculators** — nobody else does the whole kingdom command
center. Lean into that.

---

## Phase 1 — Player tools & quick wins (in progress)
- [x] **Calculator Suite** (`/calculators`) — Speedups, Resources, Action Points (shipped)
- [ ] More calculators: troop training cost/time, healing, commander sculptures, commander
      XP/tomes, VIP points, building/research cost. *(Each needs verified game-data tables.)*
- [ ] Commander database + pairing/meta tier list (revive archived commander data)
- [ ] Equipment builder / set comparer + crafting material calculator
- [ ] Talent-tree builder

## Phase 2 — Foundation for "anyone" + monetization
- [ ] **Real authentication** (Supabase Auth: email + Discord) — replace client-side
      passwords. This is the #1 blocker for a public/paid product.
- [ ] **Multi-tenancy** — `tenant_id` on every table + "create your kingdom" signup so any
      alliance gets isolated data. Turns this into a sellable SaaS.
- [ ] Proper migration system + CI that actually builds (the repo shipped with missing
      tables, broken migration order, gitignored required files, broken LFS — all patched
      locally; needs to be made repeatable).
- [ ] Mobile responsiveness audit (most players are on phones).
- [ ] Paginate/virtualize large data views (DKP loads ~900+ players client-side).

## Phase 3 — Revenue
- [ ] Per-kingdom premium tier: KvK analytics, multi-season history, more storage,
      Discord bot (mirrors statsmaster/rokstats per-kingdom subscription model).
- [ ] Free tier: calculators + meta (traffic driver), with optional ads.
- [ ] Discord bot (adapters/ stubs already exist) — many competitors live in Discord.

## Existing-feature upgrades requested
### AoO Planner
- [ ] Drag-and-drop roster → zone assignment with power balancing per team
- [ ] Auto-suggest balanced teams from roster power
- [ ] Live availability heatmap from training polls
- [ ] Per-zone shareable export images for Discord

### KvK War Room (inspired by statsmaster territory tools)
- [ ] Territory simulation / "game-accurate" planning overlay
- [ ] Rally timing & target assignment board
- [ ] Player location lookup on the map
- [ ] Live achievement-progress diffing across scans

## Data ingestion (the moat for stats features)
- [ ] Harden the OCR/scanner pipeline (archived Tesseract/Roboflow) for reliable kingdom
      scans instead of manual uploads.
- [ ] Decide stance on automated game-API scraping (ToS gray area; the bundled daily
      scraper currently uses game-account login).

---

*Phase 1 calculator suite shipped. Phases 2–3 are the path to "perfect tool for anyone"
and monetization.*
