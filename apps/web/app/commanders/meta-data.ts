// Rise of Kingdoms commander pairing meta — built from REAL live battle data.
// Source: rokbattles.com live battle-report feed (what top players actually run),
// sampled June 2026 and ranked by usage frequency + kill output. This reflects the
// current server meta, not guide opinion. Editable; tiers are usage/impact-based.

export type Tier = 'S' | 'A' | 'B';

export interface Pairing {
  primary: string;
  secondary: string;
  tier: Tier;
  troop: 'Infantry' | 'Cavalry' | 'Archer' | 'Mixed';
  note?: string;
}

export interface MetaCategory {
  id: string;
  name: string;
  desc: string;
  pairings: Pairing[];
}

export const META_PATCH = 'From live battle data (rokbattles.com) · sampled June 2026';

export const COMMANDER_META: MetaCategory[] = [
  {
    id: 'open-field',
    name: 'Open Field',
    desc: 'The marches top players actually run in open-field PvP, ranked by how often they appear in live battle reports.',
    pairings: [
      { primary: 'Liu Che', secondary: 'Sun Tzu', tier: 'S', troop: 'Infantry', note: 'The single most-run march on live servers right now.' },
      { primary: 'Qin Shi Huang', secondary: 'Zhuge Liang', tier: 'S', troop: 'Archer', note: 'Top archer march — everywhere in current battles.' },
      { primary: 'Qin Shi Huang', secondary: 'Yi Seong-Gye', tier: 'S', troop: 'Archer', note: 'Huge kill output (200k+ avg in tracked fights).' },
      { primary: 'Shapur I', secondary: 'Zhuge Liang', tier: 'S', troop: 'Archer', note: 'Highest single-battle kills tracked (1.1M).' },
      { primary: 'David IV', secondary: 'Hector', tier: 'A', troop: 'Infantry', note: 'Monster infantry carry — million-kill fights.' },
      { primary: 'Bai Qi', secondary: 'Sun Tzu', tier: 'A', troop: 'Infantry', note: 'Common, hard-hitting infantry line.' },
      { primary: 'Sun Tzu', secondary: 'William Wallace', tier: 'A', troop: 'Infantry', note: 'Frequent infantry bruiser pairing.' },
      { primary: 'Achilles', secondary: 'Arthur Pendragon', tier: 'A', troop: 'Infantry', note: 'Very common leadership/infantry march.' },
    ],
  },
  {
    id: 'rally',
    name: 'Rally / Attack',
    desc: 'High-burst offensive pairings seen attacking objectives and cities in the live feed.',
    pairings: [
      { primary: 'Liu Che', secondary: 'Philip II', tier: 'A', troop: 'Infantry', note: 'Frequent offensive infantry burst.' },
      { primary: 'Bai Qi', secondary: 'Liu Che', tier: 'A', troop: 'Infantry', note: 'Heavy infantry damage with strong trades.' },
      { primary: 'Hermann', secondary: 'Zhuge Liang', tier: 'A', troop: 'Archer', note: 'Archer burst line for assaults.' },
      { primary: 'Huo Qubing', secondary: 'Zhuge Liang', tier: 'B', troop: 'Mixed', note: 'Mobile archer harass.' },
    ],
  },
  {
    id: 'garrison',
    name: 'Garrison / Defense',
    desc: 'The pairings most often seen DEFENDING in live battles — the current top garrison/anti-rally setups.',
    pairings: [
      { primary: 'Gorgo', secondary: 'Tokugawa Ieyasu', tier: 'S', troop: 'Infantry', note: 'Most-seen defender pairing on live servers.' },
      { primary: 'Gorgo', secondary: 'Heraclius', tier: 'A', troop: 'Infantry', note: 'Healing-heavy garrison wall.' },
      { primary: 'Achilles', secondary: 'Gang Gamchan', tier: 'A', troop: 'Mixed', note: 'Common defensive setup that trades well.' },
    ],
  },
  {
    id: 'cavalry',
    name: 'Cavalry / Mobility',
    desc: 'Fast cavalry pairings from the live feed for ganking, flag chains, and map control.',
    pairings: [
      { primary: 'Achilles', secondary: 'Attila', tier: 'A', troop: 'Cavalry', note: 'Frequent fast cavalry pairing.' },
    ],
  },
];
