// Governor profile assembly — a permanent, shareable per-player record built
// from data the app already has:
//   * the kingdom scan (loadLatestPlayersWithFallback) — power, kills, deads, KP
//   * the shared DKP config — turns raw stats into rank / pass-fail / gap
//   * MGE history — what each governor applied for and won
// Keyed by governor ID (stable across name changes) but resolvable by name too.

import { supabase } from '@/lib/supabase';
import {
  loadLatestPlayersWithFallback,
  loadSharedConfig,
  normalizeName,
  type Player,
} from '@/app/dkp/data';
import { DEFAULT_CONFIG, type Config } from '@/lib/dkp/scoring';

export interface GovernorStanding extends Player {
  rank: number;          // by DKP score, 1 = best
  total: number;         // kingdom size in the scan
  percentile: number;    // 1 = top
  simpleDkp: number;
  simpleTarget: number;
  simpleStatus: 'PASS' | 'BELOW';
  minDeads: number;
  totalDeaths: number;
  deadsPass: boolean;
}

export interface MgeHistoryEntry {
  eventId: number;
  eventDate: string;
  eventTheme: string;        // e.g. "Infantry MGE" or a legacy commander
  commander: string;         // the commander this governor applied with
  status: 'won' | 'approved' | 'pending' | 'declined' | 'waitlisted' | 'withdrawn';
  tier: string | null;       // assigned/final tier if any
}

export interface GovernorProfile {
  standing: GovernorStanding;
  alliance: string | null;   // best-effort, from their latest MGE application
  mge: MgeHistoryEntry[];
}

/** Rank every scanned player by the DKP simple-score, attaching pass/deads. */
export function computeStandings(players: Player[], config: Config): GovernorStanding[] {
  const f = config.simpleFormula;
  const scored = players.map((p) => {
    const simpleDkp =
      (p.t4Kills ?? 0) * f.t4Kill +
      (p.t5Kills ?? 0) * f.t5Kill +
      (p.t4Deaths ?? 0) * f.t4Death +
      (p.t5Deaths ?? 0) * f.t5Death;
    const simpleTarget = p.power * config.simpleMultiplier;
    const minDeads = p.power * (config.simpleMinDeadsPct / 100);
    const totalDeaths = (p.t4Deaths ?? 0) + (p.t5Deaths ?? 0);
    return {
      ...p,
      simpleDkp,
      simpleTarget,
      simpleStatus: (simpleDkp >= simpleTarget ? 'PASS' : 'BELOW') as 'PASS' | 'BELOW',
      minDeads,
      totalDeaths,
      deadsPass: totalDeaths >= minDeads,
    };
  });
  // Rank by DKP, power as tiebreak (same order the Warrior Profile uses)
  scored.sort((a, b) => b.simpleDkp - a.simpleDkp || b.power - a.power);
  const total = scored.length;
  return scored.map((p, i) => ({
    ...p,
    rank: i + 1,
    total,
    percentile: Math.max(1, Math.round(((i + 1) / Math.max(1, total)) * 100)),
  }));
}

/** Load scan + shared config and return every governor's standing, ranked.
 * The stored config can be PARTIAL (the DKP page persists only changed keys),
 * so merge over the defaults — otherwise simpleFormula etc. may be missing. */
export async function loadStandings(): Promise<GovernorStanding[]> {
  const [players, shared] = await Promise.all([
    loadLatestPlayersWithFallback(),
    loadSharedConfig<Partial<Config>>().catch(() => null),
  ]);
  const config: Config = {
    ...DEFAULT_CONFIG,
    ...(shared ?? {}),
    simpleFormula: { ...DEFAULT_CONFIG.simpleFormula, ...(shared?.simpleFormula ?? {}) },
    simpleMultiplier: shared?.simpleMultiplier ?? DEFAULT_CONFIG.simpleMultiplier,
    simpleMinDeadsPct: shared?.simpleMinDeadsPct ?? DEFAULT_CONFIG.simpleMinDeadsPct,
  };
  return computeStandings(players, config);
}

/** Resolve a route param (governor ID digits, or a name) to a standing. */
export function findStanding(standings: GovernorStanding[], idOrName: string): GovernorStanding | null {
  const raw = decodeURIComponent(idOrName).trim();
  if (/^\d+$/.test(raw)) {
    const byId = standings.find((s) => String(s.characterId) === raw);
    if (byId) return byId;
  }
  const n = normalizeName(raw);
  return standings.find((s) => normalizeName(s.username) === n) ?? null;
}

interface MgeEventRow {
  id: number;
  event_date: string;
  focused_commander: string;
  status: string;
  mge_applications: {
    applicant_name: string;
    applicant_alliance: string | null;
    commander_name: string;
    status: string;
    assigned_tier: string | null;
    dkp_match_name: string | null;
    created_at: string;
  }[];
  mge_selections: { member_name: string; ranking_tier: string }[];
}

/** MGE history + best-effort alliance for one governor, matched by name. */
export async function loadMgeHistory(username: string): Promise<{ history: MgeHistoryEntry[]; alliance: string | null }> {
  const { data, error } = await supabase
    .from('mge_events')
    .select('id, event_date, focused_commander, status, mge_applications(applicant_name, applicant_alliance, commander_name, status, assigned_tier, dkp_match_name, created_at), mge_selections(member_name, ranking_tier)')
    .order('event_date', { ascending: false });

  if (error || !data) return { history: [], alliance: null };

  const target = normalizeName(username);
  const history: MgeHistoryEntry[] = [];
  let alliance: string | null = null;
  let allianceAt = '';

  for (const evt of data as MgeEventRow[]) {
    const app = (evt.mge_applications || []).find(
      (a) => normalizeName(a.applicant_name) === target || (a.dkp_match_name && normalizeName(a.dkp_match_name) === target),
    );
    if (!app) continue;

    // most-recent application alliance wins
    if (app.applicant_alliance && app.created_at > allianceAt) {
      alliance = app.applicant_alliance;
      allianceAt = app.created_at;
    }

    const selection = (evt.mge_selections || []).find((s) => normalizeName(s.member_name) === target);
    let status: MgeHistoryEntry['status'];
    if (selection) status = 'won';
    else status = (app.status as MgeHistoryEntry['status']) || 'pending';

    history.push({
      eventId: evt.id,
      eventDate: evt.event_date,
      eventTheme: evt.focused_commander,
      commander: app.commander_name,
      status,
      tier: selection?.ranking_tier ?? app.assigned_tier ?? null,
    });
  }
  return { history, alliance };
}

/** Full profile for a governor route param. Null when not in the scan. */
export async function loadGovernorProfile(idOrName: string): Promise<GovernorProfile | null> {
  const standings = await loadStandings();
  const standing = findStanding(standings, idOrName);
  if (!standing) return null;
  const { history, alliance } = await loadMgeHistory(standing.username);
  return { standing, alliance, mge: history };
}
