// Kingdom roster for MGE name pickers.
//
// Primary source: the latest DKP dataset (the real kingdom scan — 176 players
// with governor IDs and power). The alliance_roster table is only a fallback:
// it's a separate manually-managed table that is empty unless officers
// populate it, which is why name search showed "No matches".

import { supabase } from '../supabase';
import { loadLatestPlayersWithFallback } from '@/app/dkp/data';

export interface KingdomMember {
  name: string;
  govId: string | null;   // governor ID from the kingdom scan
  power: number | null;
  alliance: string | null;
}

export async function loadKingdomRoster(): Promise<KingdomMember[]> {
  // 1) Kingdom scan — uploaded dataset, else the bundled KD3709 export
  //    (same chain the DKP page uses)
  try {
    const players = await loadLatestPlayersWithFallback();
    if (players.length > 0) {
      return [...players]
        .sort((a, b) => b.power - a.power)
        .map((p) => ({
          name: p.username,
          govId: p.characterId ? String(p.characterId) : null,
          power: p.power ?? null,
          alliance: null,
        }));
    }
  } catch (e) {
    console.error('loadKingdomRoster: kingdom scan failed, falling back to alliance_roster', e);
  }

  // 2) Fallback: alliance_roster (may be empty)
  const { data } = await supabase
    .from('alliance_roster')
    .select('id, name, alliance, power')
    .eq('is_active', true)
    .order('power', { ascending: false });
  return (data || []).map((m: { name: string; alliance: string | null; power: number | null }) => ({
    name: m.name,
    govId: null,
    power: m.power ?? null,
    alliance: m.alliance ?? null,
  }));
}

export function formatRosterPower(power: number | null): string {
  if (power == null) return '';
  if (power >= 1_000_000) return `${(power / 1_000_000).toFixed(1)}M`;
  if (power >= 1_000) return `${(power / 1_000).toFixed(0)}K`;
  return String(power);
}
